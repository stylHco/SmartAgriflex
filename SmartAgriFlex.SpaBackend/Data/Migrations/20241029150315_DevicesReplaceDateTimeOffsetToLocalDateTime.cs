using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartAgriFlex.SpaBackend.Data.Migrations
{
    /// <inheritdoc />
    public partial class DevicesReplaceDateTimeOffsetToLocalDateTime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTime>(
                name: "InstalledDate",
                table: "Devices",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(DateTimeOffset),
                oldType: "datetimeoffset",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<DateTimeOffset>(
                name: "InstalledDate",
                table: "Devices",
                type: "datetimeoffset",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
