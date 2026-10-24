package ma.lias.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name="teams")
public class Team {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(nullable=false) private String name;
  @Column(length=2000) private String description;
  @Column(length=1000) private String theme;
  @Column(name="created_at", nullable=false) private LocalDateTime createdAt = LocalDateTime.now();
  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public String getName(){return name;} public void setName(String name){this.name=name;}
  public String getDescription(){return description;} public void setDescription(String description){this.description=description;}
  public String getTheme(){return theme;} public void setTheme(String theme){this.theme=theme;}
  public LocalDateTime getCreatedAt(){return createdAt;} public void setCreatedAt(LocalDateTime createdAt){this.createdAt=createdAt;}
}
