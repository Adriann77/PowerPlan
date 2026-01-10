using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Models;

namespace PowerPlanAPI.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Session> Sessions => Set<Session>();
    public DbSet<WorkoutPlan> WorkoutPlans => Set<WorkoutPlan>();
    public DbSet<TrainingDay> TrainingDays => Set<TrainingDay>();
    public DbSet<Exercise> Exercises => Set<Exercise>();
    public DbSet<WorkoutSession> WorkoutSessions => Set<WorkoutSession>();
    public DbSet<ExerciseLog> ExerciseLogs => Set<ExerciseLog>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        // Users
        mb.Entity<User>().HasKey(u => u.Id);
        mb.Entity<User>().HasIndex(u => u.Username).IsUnique();

        // Sessions
        mb.Entity<Session>().HasKey(s => s.Id);
        mb.Entity<Session>().HasIndex(s => s.Token).IsUnique();
        mb.Entity<Session>().HasOne(s => s.User).WithMany(u => u.Sessions).HasForeignKey(s => s.UserId);
// Workout Plans
        mb.Entity<WorkoutPlan>().HasKey(w => w.Id);
        mb.Entity<WorkoutPlan>().HasIndex(w => new { w.UserId, w.Name }).IsUnique();
        mb.Entity<WorkoutPlan>().HasOne(w => w.User).WithMany(u => u.WorkoutPlans).HasForeignKey(w => w.UserId);

        // Training Days
        mb.Entity<TrainingDay>().HasKey(t => t.Id);
        mb.Entity<TrainingDay>().HasIndex(t => new { t.WorkoutPlanId, t.Name }).IsUnique();
        mb.Entity<TrainingDay>().HasOne(t => t.WorkoutPlan).WithMany(w => w.TrainingDays).HasForeignKey(t => t.WorkoutPlanId).OnDelete(DeleteBehavior.Cascade);

        // Уникальность is_active = true только один на пользователя
mb.Entity<WorkoutPlan>()
    .HasIndex(w => w.IsActive)
    .HasFilter("\"IsActive\" = true");

        // Остальные связи
        mb.Entity<Exercise>().HasOne(e => e.TrainingDay).WithMany(t => t.Exercises).HasForeignKey(e => e.TrainingDayId).OnDelete(DeleteBehavior.Cascade);
        mb.Entity<WorkoutSession>().HasOne(ws => ws.WorkoutPlan).WithMany(w => w.WorkoutSessions).HasForeignKey(ws => ws.WorkoutPlanId).OnDelete(DeleteBehavior.Cascade);
        mb.Entity<WorkoutSession>().HasOne(ws => ws.TrainingDay).WithMany(t => t.WorkoutSessions).HasForeignKey(ws => ws.TrainingDayId).OnDelete(DeleteBehavior.Cascade);
        mb.Entity<ExerciseLog>().HasOne(el => el.WorkoutSession).WithMany(ws => ws.ExerciseLogs).HasForeignKey(el => el.WorkoutSessionId).OnDelete(DeleteBehavior.Cascade);
        mb.Entity<ExerciseLog>().HasOne(el => el.Exercise).WithMany(e => e.ExerciseLogs).HasForeignKey(el => el.ExerciseId).OnDelete(DeleteBehavior.Cascade);

        // Enum
        mb.Entity<ExerciseLog>().Property(el => el.NextPreference).HasColumnType("text")
            .HasConversion(
                v => v.ToString(),
                v => Enum.Parse<NextWeightPreference>(v));
    }
} 