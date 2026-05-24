package com.consultorio.app.security;

import com.consultorio.app.model.Usuario;
import com.consultorio.app.model.enums.EstadoUsuario;
import com.consultorio.app.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Implementacion de UserDetailsService para integracion con Spring Security.
 * Carga el usuario desde la base de datos para la verificacion de credenciales.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String nombreUsuario) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository
                .findByNombreUsuarioAndEstado(nombreUsuario, EstadoUsuario.activo)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "Usuario no encontrado: " + nombreUsuario));

        return new org.springframework.security.core.userdetails.User(
                String.valueOf(usuario.getIdUsuario()),
                usuario.getContrasenaHash(),
                List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().name().toUpperCase()))
        );
    }
}
