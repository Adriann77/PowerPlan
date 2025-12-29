using PowerPlanAPI.Models;
using PowerPlanAPI.Data;
using System.Linq;
using System;

namespace PowerPlanAPI.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Exercises.Any()) return;

            // 1. TWORZYMY UŻYTKOWNIKA (uproszczony model)
            var testUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Username = "testuser",
                // Usunąłem Email, bo powodował błąd CS0117
                PasswordHash = "placeholder_hash",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.Users.Add(testUser);

            // 2. TWORZYMY PLAN
            var testPlan = new WorkoutPlan
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Mój Pierwszy Plan",
                UserId = testUser.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.WorkoutPlans.Add(testPlan);

            // 3. TWORZYMY DZIEŃ
            var testDay = new TrainingDay
            {
                Id = Guid.NewGuid().ToString(),
                Name = "Dzień Klatki",
                WorkoutPlanId = testPlan.Id,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            context.TrainingDays.Add(testDay);

            // 4. TWORZYMY ĆWICZENIE
            var exercise = new Exercise 
            { 
                Id = Guid.NewGuid().ToString(), 
                Name = "Push-ups", 
                Description = "Klasyczne pompki",
                TrainingDayId = testDay.Id,
                OrderNumber = "1",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            context.Exercises.Add(exercise);
            context.SaveChanges();
            Console.WriteLine("--- SEEDING ZAKOŃCZONY SUKCESEM ---");
        }
    }
}