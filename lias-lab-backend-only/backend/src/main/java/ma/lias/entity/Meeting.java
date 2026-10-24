package ma.lias.entity;
import jakarta.persistence.*; import java.time.LocalDateTime;
@Entity @Table(name="meetings")
public class Meeting {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  private String title;
  private LocalDateTime date;
  @Column(length=5000) private String agenda;
  private String location;
  @Column(name="pv_content", columnDefinition="TEXT") private String pvContent;
  @Column(name="pv_url") private String pvUrl;
  @Column(name="created_by") private Long createdBy;
  public Long getId(){return id;} public void setId(Long id){this.id=id;}
  public String getTitle(){return title;} public void setTitle(String title){this.title=title;}
  public LocalDateTime getDate(){return date;} public void setDate(LocalDateTime date){this.date=date;}
  public String getAgenda(){return agenda;} public void setAgenda(String agenda){this.agenda=agenda;}
  public String getLocation(){return location;} public void setLocation(String location){this.location=location;}
  public String getPvContent(){return pvContent;} public void setPvContent(String pvContent){this.pvContent=pvContent;}
  public String getPvUrl(){return pvUrl;} public void setPvUrl(String pvUrl){this.pvUrl=pvUrl;}
  public Long getCreatedBy(){return createdBy;} public void setCreatedBy(Long createdBy){this.createdBy=createdBy;}
}
