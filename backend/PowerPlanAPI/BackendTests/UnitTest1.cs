using Microsoft.EntityFrameworkCore;
using PowerPlanAPI.Models; 
using PowerPlanAPI.Data;   

namespace BackendTests;

public class DatabaseTests
{
    private string GetConnectionString()
    {
        return "Host=localhost;Database=postgres;Username=postgres;Password=admin123";
    }

    [Fact]
    public void DatabaseShouldHaveSeededExercises()
    {
        // Arrange
        var options = new DbContextOptionsBuilder<AppDbContext>() 
            .UseNpgsql(GetConnectionString())
            .Options;

        // Act
        using (var context = new AppDbContext(options)) 
        {
            var exercises = context.Exercises.ToList();

            // Assert
            Assert.NotNull(exercises);
            Assert.NotEmpty(exercises);
            Assert.Contains(exercises, e => e.Name.Contains("Push-ups"));
        }
    }
} 