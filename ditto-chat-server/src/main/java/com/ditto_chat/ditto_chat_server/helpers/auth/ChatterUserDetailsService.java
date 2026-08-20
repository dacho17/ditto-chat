package com.ditto_chat.ditto_chat_server.helpers.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.repositories.ChatterRepository;

@Service("chatterUserDetailsService")
public class ChatterUserDetailsService implements UserDetailsService {
    @Autowired
    private ChatterRepository chatterRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Chatter chatter = chatterRepository.retrieveByEmail(email);
        if (chatter == null) {
            throw new UsernameNotFoundException("Chatter not found by ChatterUserDetailsService.");
        }

        return new ChatterUserDetails(chatter);
    }
}
