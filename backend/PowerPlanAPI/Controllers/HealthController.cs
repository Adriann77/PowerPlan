using Microsoft.AspNetCore.Mvc;
using PowerPlanAPI.Data;

namespace PowerPlanAPI.Controllers
{
    [ApiController]
    [Route("health")]
    public class HealthController : ControllerBase
    {
        private readonly AppDbContext _db;

        public HealthController(AppDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public IActionResult GetHealth()
        {
            bool dbOk = false;

            try
            {
                dbOk = _db.Users.Any();
            }
            catch
            {
                dbOk = false;
            }

            return Ok(new
            {
                status = "OK",
                time = DateTime.UtcNow,
                db = dbOk ? "connected" : "error"
            });
        }
    }
}
