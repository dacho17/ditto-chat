package com.ditto_chat.ditto_chat_server.config;

import java.util.ArrayList;
import java.util.List;

import org.hibernate.Session;
import org.hibernate.SessionFactory;
import org.hibernate.jpa.HibernatePersistenceConfiguration;
import org.hibernate.tool.schema.Action;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Scope;
import org.springframework.context.annotation.ScopedProxyMode;
import org.springframework.web.context.WebApplicationContext;

import com.ditto_chat.ditto_chat_server.entities.AccountImage;
import com.ditto_chat.ditto_chat_server.entities.ChatThread;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadMessage;
import com.ditto_chat.ditto_chat_server.entities.ChatThreadParticipant;
import com.ditto_chat.ditto_chat_server.entities.Chatter;
import com.ditto_chat.ditto_chat_server.entities.SharedFile;
import com.ditto_chat.ditto_chat_server.entities.UploadedFile;
import com.zaxxer.hikari.HikariDataSource;

@Configuration
public class PersistenceConfig {
    @Value("${DITTO_CHAT_DATABASE_URL}")
    private String DATABASE_URL;
    @Value("${DITTO_CHAT_MYSQL_USER}")
    private String DATABASE_USER;
    @Value("${DITTO_CHAT_MYSQL_USER_TEST_PASSWORD}")
    private String DATABASE_USER_PASSWORD;

    @Bean
    @Scope("singleton")    
    public HikariDataSource dataSource() {
        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(DATABASE_URL);
        dataSource.setUsername(DATABASE_USER);
        dataSource.setPassword(DATABASE_USER_PASSWORD);
        // hikariConfig.setSchema(null);    // NOTE: can be used if for some reason Jdbc url needs to point at the DB server endpoint, and not to DB schema

        dataSource.setIdleTimeout(0);
        dataSource.setConnectionTimeout(1000);
        dataSource.setKeepaliveTime(0);

        dataSource.setMinimumIdle(4);
        dataSource.setMaximumPoolSize(8);
        dataSource.setPoolName("Hikari JDBC Connection Pool - Test");
        
        // NOTE: These properties can also be set with HikariDataSource, but I think they are not Connection related, but Session related.
        // So I set these values in Hibernate Config
        // dataSource.setAutoCommit(false);
        // dataSource.setTransactionIsolation("TRANSACTION_READ_COMMITTED");   // value from java.sql.Connection. It is set in entityManagerFactory

        return dataSource;
    }

    @Bean
    @Scope("singleton")
    @DependsOn("dataSource")
    public SessionFactory entityManagerFactory(HikariDataSource dataSource) {
        // Register Hibernate as the Persistence Provider and set the Persistent Unit name
        HibernatePersistenceConfiguration config = new HibernatePersistenceConfiguration("dittoChatDbPersistenceUnit");

        // Registering Peristence Unit
        // 1. Inherit DataSource configuration
        config.jdbcUrl(dataSource.getJdbcUrl());        // url contains jdbcDriver, jdbcUrl, defaultSchema
        config.jdbcCredentials(dataSource.getUsername(), dataSource.getPassword());
        config.jdbcPoolSize(dataSource.getMaximumPoolSize());

        config.jdbcTransactionIsolation(java.sql.Connection.TRANSACTION_READ_COMMITTED);
        config.jdbcAutocommit(false);

        // 2. Register Entity classes
        config.managedClasses(new ArrayList<>(List.of(
            AccountImage.class,
            Chatter.class,
            ChatThread.class,
            ChatThreadMessage.class,
            ChatThreadParticipant.class,
            SharedFile.class,
            UploadedFile.class
        )));

        // 3. Set addtional properties
        config.schemaToolingAction(Action.VALIDATE);
        config.showSql(true, true, true);
        // config.caching(CachingType.AUTO);   // this might be useful

        SessionFactory sessionFactory = config.createEntityManagerFactory();
        return sessionFactory;
    }

    @Bean
    @Scope(value = WebApplicationContext.SCOPE_REQUEST, proxyMode = ScopedProxyMode.TARGET_CLASS)
    @DependsOn("entityManagerFactory")
    public Session hibernateSession(@Qualifier("entityManagerFactory") SessionFactory hibernateSessionFactory) {
        // commiting transactions and closing the session needs to be done manually to release JDBC connection!
        return hibernateSessionFactory.openSession();          // always creates a new Session instance each time it is called
    }
}
