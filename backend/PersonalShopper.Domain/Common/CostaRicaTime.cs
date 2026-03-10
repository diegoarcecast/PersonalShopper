namespace PersonalShopper.Domain.Common;

/// <summary>
/// Provides current date/time in Costa Rica timezone (UTC-6, no DST).
/// Use this instead of DateTime.UtcNow or DateTime.Now throughout the application.
/// </summary>
public static class CostaRicaTime
{
    private static readonly TimeZoneInfo Tz =
        TimeZoneInfo.FindSystemTimeZoneById("America/Costa_Rica");

    /// <summary>Returns the current local time in Costa Rica (UTC-6).</summary>
    public static DateTime Now => TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, Tz);
}
