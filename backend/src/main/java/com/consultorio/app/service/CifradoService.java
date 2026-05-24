package com.consultorio.app.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.Base64;

/**
 * Servicio de cifrado y descifrado con AES-256-GCM.
 * 
 * Formato del BLOB almacenado en base de datos:
 *   [ IV (12 bytes) ][ Ciphertext ][ GCM Tag (16 bytes) ]
 * 
 * La clave maestra se inyecta via variable de entorno APP_ENCRYPTION_KEY
 * y nunca se persiste en la BD ni en el repositorio de codigo.
 */
@Service
@Slf4j
public class CifradoService {

    private static final String ALGORITHM  = "AES/GCM/NoPadding";
    private static final int    IV_LENGTH  = 12;  // 96 bits recomendado para GCM
    private static final int    TAG_LENGTH = 128; // 16 bytes

    private final SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public CifradoService(@Value("${app.encryption.key}") String keyBase64) {
        byte[] keyBytes = Base64.getDecoder().decode(keyBase64);
        if (keyBytes.length != 32) {
            throw new IllegalArgumentException(
                "La clave AES-256 debe ser exactamente 32 bytes (256 bits)");
        }
        this.secretKey = new SecretKeySpec(keyBytes, "AES");
    }

    /**
     * Cifra un texto plano con AES-256-GCM.
     *
     * @param textPlano Texto a cifrar
     * @return Arreglo de bytes con formato [IV][Ciphertext+Tag]
     */
    public byte[] cifrar(String textPlano) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey,
                        new GCMParameterSpec(TAG_LENGTH, iv));

            byte[] ciphertext = cipher.doFinal(textPlano.getBytes("UTF-8"));

            // Concatenar IV + ciphertext (que ya incluye el tag GCM al final)
            byte[] resultado = new byte[IV_LENGTH + ciphertext.length];
            System.arraycopy(iv,         0, resultado, 0,         IV_LENGTH);
            System.arraycopy(ciphertext, 0, resultado, IV_LENGTH, ciphertext.length);
            return resultado;
        } catch (Exception e) {
            throw new RuntimeException("Error al cifrar datos clinicos", e);
        }
    }

    /**
     * Descifra un BLOB almacenado en base de datos.
     * Lanza excepcion si la etiqueta GCM no coincide (datos alterados).
     *
     * @param datos Arreglo de bytes con formato [IV][Ciphertext+Tag]
     * @return Texto plano descifrado
     */
    public String descifrar(byte[] datos) {
        try {
            if (datos == null || datos.length <= IV_LENGTH) {
                return null;
            }
            byte[] iv         = Arrays.copyOfRange(datos, 0, IV_LENGTH);
            byte[] ciphertext = Arrays.copyOfRange(datos, IV_LENGTH, datos.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, secretKey,
                        new GCMParameterSpec(TAG_LENGTH, iv));

            byte[] plain = cipher.doFinal(ciphertext);
            return new String(plain, "UTF-8");
        } catch (Exception e) {
            log.error("Error al descifrar datos clinicos: posible alteracion de datos");
            throw new RuntimeException("Error al descifrar datos clinicos", e);
        }
    }
}
