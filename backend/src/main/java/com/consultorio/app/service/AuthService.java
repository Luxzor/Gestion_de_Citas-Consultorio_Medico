package com.consultorio.app.service;

import com.consultorio.app.dto.request.LoginRequest;
import com.consultorio.app.dto.request.RegistroRequest;
import com.consultorio.app.dto.response.AuthResponse;
import com.consultorio.app.exception.ConflictoException;
import com.consultorio.app.exception.CredencialesInvalidasException;
import com.consultorio.app.model.Paciente;
import com.consultorio.app.model.Usuario;
import com.consultorio.app.model.enums.EstadoUsuario;
import com.consultorio.app.model.enums.Rol;
import com.consultorio.app.model.enums.Sexo;
import com.consultorio.app.repository.PacienteRepository;
import com.consultorio.app.repository.UsuarioRepository;
import com.consultorio.app.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Servicio de autenticacion y registro de usuarios.
 * Gestiona el ciclo de vida de las sesiones mediante JWT.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UsuarioRepository  usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final PasswordEncoder    passwordEncoder;
    private final JwtUtil            jwtUtil;
    private final BitacoraService    bitacoraService;

    private static final int MAX_INTENTOS_FALLIDOS = 5;
    private static final DateTimeFormatter FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Registra un nuevo paciente en el sistema.
     * Crea la cuenta de usuario y los datos demograficos en una transaccion atomica.
     */
    @Transactional
    public AuthResponse registrar(RegistroRequest req, String ip) {
        if (usuarioRepository.existsByNombreUsuario(req.getNombreUsuario())) {
            throw new ConflictoException(
                    "El nombre de usuario ya existe: " + req.getNombreUsuario());
        }

        // Crear cuenta de acceso con hash bcrypt
        Usuario usuario = Usuario.builder()
                .nombreUsuario(req.getNombreUsuario())
                .contrasenaHash(passwordEncoder.encode(req.getContrasena()))
                .rol(Rol.paciente)
                .estado(EstadoUsuario.activo)
                .intentosFallidos(0)
                .build();
        usuario = usuarioRepository.save(usuario);

        // Crear perfil demografico del paciente
        Paciente paciente = Paciente.builder()
                .usuario(usuario)
                .nombre(req.getNombre())
                .direccion(req.getDireccion())
                .correo(req.getCorreo())
                .telefono(req.getTelefono())
                .edad(req.getEdad())
                .sexo(Sexo.valueOf(req.getSexo()))
                .build();
        paciente = pacienteRepository.save(paciente);

        bitacoraService.registrar(usuario.getIdUsuario(), "REGISTRO_PACIENTE",
                "Nuevo paciente: " + req.getNombreUsuario(), ip);

        String token = jwtUtil.generarToken(usuario.getIdUsuario(), usuario.getRol().name());
        return construirAuthResponse(token, usuario, paciente.getIdPaciente());
    }

    /**
     * Autentica un usuario verificando credenciales y emitiendo un JWT.
     * Implementa bloqueo temporal tras 5 fallos consecutivos.
     */
    @Transactional(noRollbackFor = CredencialesInvalidasException.class)
    public AuthResponse login(LoginRequest req, String ip) {
        Usuario usuario = usuarioRepository
                .findByNombreUsuario(req.getNombreUsuario())
                .orElseThrow(() -> {
                    bitacoraService.registrar(null, "LOGIN_FALLIDO",
                            "Usuario no encontrado: " + req.getNombreUsuario(), ip);
                    return new CredencialesInvalidasException("Credenciales invalidas");
                });

        // Verificar si la cuenta esta bloqueada temporalmente
        if (usuario.getBloqueadoHasta() != null &&
            usuario.getBloqueadoHasta().isAfter(LocalDateTime.now())) {
            throw new CredencialesInvalidasException(
                    "Cuenta bloqueada temporalmente. Intente despues de: "
                    + usuario.getBloqueadoHasta().format(FORMATTER));
        }

        // Verificar contrasena con bcrypt
        if (!passwordEncoder.matches(req.getContrasena(), usuario.getContrasenaHash())) {
            int intentos = usuario.getIntentosFallidos() + 1;
            usuario.setIntentosFallidos(intentos);

            if (intentos >= MAX_INTENTOS_FALLIDOS) {
                // Bloqueo exponencial: 2^(intentos-5) minutos, max 60
                long minutosBloqueo = Math.min(
                        (long) Math.pow(2, intentos - MAX_INTENTOS_FALLIDOS), 60);
                usuario.setBloqueadoHasta(LocalDateTime.now().plusMinutes(minutosBloqueo));
                log.warn("Cuenta bloqueada por {} minutos: {}", minutosBloqueo, req.getNombreUsuario());
            }
            usuarioRepository.save(usuario);

            bitacoraService.registrar(usuario.getIdUsuario(), "LOGIN_FALLIDO",
                    "Intento " + intentos, ip);
            throw new CredencialesInvalidasException("Credenciales invalidas");
        }

        // Restablecer contador de fallos y emitir token
        usuario.setIntentosFallidos(0);
        usuario.setBloqueadoHasta(null);
        usuarioRepository.save(usuario);

        String token = jwtUtil.generarToken(usuario.getIdUsuario(), usuario.getRol().name());
        bitacoraService.registrar(usuario.getIdUsuario(), "LOGIN_EXITOSO", null, ip);
        Long idPaciente = usuario.getRol() == Rol.paciente
                ? pacienteRepository.findByUsuario_IdUsuario(usuario.getIdUsuario())
                        .map(Paciente::getIdPaciente).orElse(null)
                : null;
        return construirAuthResponse(token, usuario, idPaciente);
    }

    /** Invalida el token del usuario (logout). */
    public void logout(String token, Long idUsuario, String ip) {
        jwtUtil.invalidarToken(token);
        bitacoraService.registrar(idUsuario, "LOGOUT", null, ip);
    }

    private AuthResponse construirAuthResponse(String token, Usuario usuario, Long idPaciente) {
        LocalDateTime expiracion = LocalDateTime.ofInstant(
                Instant.now().plusMillis(28800000), ZoneId.systemDefault());
        return AuthResponse.builder()
                .token(token)
                .rol(usuario.getRol().name())
                .idUsuario(usuario.getIdUsuario())
                .idPaciente(idPaciente)
                .expiracion(expiracion.format(FORMATTER))
                .build();
    }
}
