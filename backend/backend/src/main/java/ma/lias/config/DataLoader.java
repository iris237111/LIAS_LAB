package ma.lias.config;

import ma.lias.entity.AppRole;
import ma.lias.entity.SystemSetting;
import ma.lias.entity.User;
import ma.lias.repository.SystemSettingRepository;
import ma.lias.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataLoader {
  private static final String DEFAULT_ADMIN_EMAIL = "admin@lias.local";
  private static final String DEFAULT_ADMIN_PASSWORD = "Admin123!";

  @Bean
  CommandLineRunner seedMinimalBackend(UserRepository users, SystemSettingRepository settings, PasswordEncoder encoder) {
    return args -> {
      if (users.count() == 0) {
        User admin = new User();
        admin.setEmail(DEFAULT_ADMIN_EMAIL);
        admin.setPasswordHash(encoder.encode(DEFAULT_ADMIN_PASSWORD));
        admin.setAppRole(AppRole.ADMIN);
        users.save(admin);
      }

      if (settings.count() == 0) {
        saveSetting(settings, "lab_name", "Laboratoire LIAS");
        saveSetting(settings, "lab_subtitle", "Plateforme de gestion du laboratoire");
        saveSetting(settings, "lab_establishment", "Faculté des Sciences Ben M'Sik");
        saveSetting(settings, "lab_address", "Casablanca, Maroc");
        saveSetting(settings, "lab_contact_email", "contact@example.local");
        saveSetting(settings, "lab_contact_phone", "");
        saveSetting(settings, "lab_website", "");
        saveSetting(settings, "lab_creation_date", "");
        saveSetting(settings, "lab_public_description", "Application JEE de gestion du laboratoire : membres, équipes, événements, publications, documents, matériel, demandes, réunions, conventions, notifications, audit et rapports annuels.");
      }
    };
  }

  private void saveSetting(SystemSettingRepository settings, String key, String value) {
    SystemSetting setting = new SystemSetting();
    setting.setSettingKey(key);
    setting.setSettingValue(value);
    settings.save(setting);
  }
}
