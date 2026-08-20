package com.ditto_chat.ditto_chat_server.helpers.auth;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.ditto_chat.ditto_chat_server.entities.Chatter;

public class ChatterUserDetails implements UserDetails {
	private final UUID id;
	private final String email;
	private final String password;
		
	public ChatterUserDetails(Chatter chatter) {
		this.id = chatter.getId();
		this.email = chatter.getEmail();
		this.password = chatter.getPassword();
	}

	public UUID getId() {
		return this.id;
	}

	@Override
	public String getUsername() {
		return this.email;
	}

	@Override
	public String getPassword() {
		return this.password;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return List.of();
	}
	
	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
