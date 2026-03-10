using ClosedXML.Excel;
using PersonalShopper.Application.Interfaces;
using PersonalShopper.Domain.Interfaces;

namespace PersonalShopper.Infrastructure.Services;

public class ExportService(IOrderRepository orderRepo) : IExportService
{
    private static readonly string[] Headers = { "ID", "Nombre Persona", "Producto", "Descripción", "Red Social", "Usuario Red Social", "Código TDJ", "Fecha" };

    public async Task<byte[]> ExportOrdersToExcelAsync(int dayId)
    {
        var orders = await orderRepo.GetAllByDayIdAsync(dayId);
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Órdenes");
        WriteHeaders(ws, Headers);
        int row = 2;
        foreach (var o in orders)
        {
            WriteOrderRow(ws, row++, o);
        }
        ws.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public async Task<byte[]> ExportTripToExcelAsync(int tripId)
    {
        var orders = await orderRepo.GetAllByTripIdAsync(tripId);
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Viaje");
        var allHeaders = new[] { "Día #" }.Concat(Headers).ToArray();
        WriteHeaders(ws, allHeaders);
        int row = 2;
        foreach (var o in orders)
        {
            ws.Cell(row, 1).Value = o.Day?.DayNumber ?? 0;
            WriteOrderRow(ws, row++, o, colOffset: 1);
        }
        ws.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    public async Task<byte[]> ExportProjectToExcelAsync(int projectId)
    {
        var orders = await orderRepo.GetAllByProjectIdAsync(projectId);
        using var workbook = new XLWorkbook();
        var ws = workbook.Worksheets.Add("Proyecto");
        var allHeaders = new[] { "Viaje", "Día #" }.Concat(Headers).ToArray();
        WriteHeaders(ws, allHeaders);
        int row = 2;
        foreach (var o in orders)
        {
            ws.Cell(row, 1).Value = o.Day?.Trip?.Name ?? "";
            ws.Cell(row, 2).Value = o.Day?.DayNumber ?? 0;
            WriteOrderRow(ws, row++, o, colOffset: 2);
        }
        ws.Columns().AdjustToContents();
        using var stream = new MemoryStream();
        workbook.SaveAs(stream);
        return stream.ToArray();
    }

    private static void WriteHeaders(IXLWorksheet ws, string[] headers)
    {
        for (int i = 0; i < headers.Length; i++)
        {
            var cell = ws.Cell(1, i + 1);
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#4472C4");
            cell.Style.Font.FontColor = XLColor.White;
        }
    }

    private static void WriteOrderRow(IXLWorksheet ws, int row, Domain.Entities.Order o, int colOffset = 0)
    {
        ws.Cell(row, colOffset + 1).Value = o.Id;
        ws.Cell(row, colOffset + 2).Value = o.NombrePersona;
        ws.Cell(row, colOffset + 3).Value = o.Producto ?? "";
        ws.Cell(row, colOffset + 4).Value = o.Descripcion ?? "";
        ws.Cell(row, colOffset + 5).Value = o.RedSocial.ToString();
        ws.Cell(row, colOffset + 6).Value = o.UsuarioRedSocial ?? "";
        ws.Cell(row, colOffset + 7).Value = o.UsuarioAsignadoFuturo ?? "";
        ws.Cell(row, colOffset + 8).Value = o.CreatedAt.ToString("yyyy-MM-dd HH:mm");
    }
}
