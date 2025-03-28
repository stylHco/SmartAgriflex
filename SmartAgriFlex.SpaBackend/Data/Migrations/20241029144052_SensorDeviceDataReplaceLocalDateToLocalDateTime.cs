using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartAgriFlex.SpaBackend.Data.Migrations
{
    /// <inheritdoc />
    public partial class SensorDeviceDataReplaceLocalDateToLocalDateTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "RecordDate",
                table: "SensorDeviceDatas",
                type: "datetime2",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "date");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "RecordDate",
                table: "SensorDeviceDatas",
                type: "date",
                nullable: false,
                oldClrType: typeof(DateTime),
                oldType: "datetime2");
        }
    }
}
