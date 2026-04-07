package com.coworking.reservas.config;

import com.coworking.reservas.domain.Usuario;
import com.coworking.reservas.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByCorreoIgnoreCase(username.trim().toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("No existe un usuario registrado con ese correo"));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new DisabledException("La cuenta se encuentra inactiva");
        }

        return new UsuarioDetails(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getCorreo(),
                usuario.getPassword(),
                usuario.getActivo(),
                usuario.getRol().getNombre(),
                usuario.getFechaRegistro()
        );
    }
}
