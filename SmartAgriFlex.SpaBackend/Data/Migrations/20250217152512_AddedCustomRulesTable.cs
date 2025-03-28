using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SmartAgriFlex.SpaBackend.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddedCustomRulesTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CustomRules",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SensorId = table.Column<int>(type: "int", nullable: false),
                    Min = table.Column<decimal>(type: "decimal(15,3)", precision: 15, scale: 3, nullable: true),
                    Max = table.Column<decimal>(type: "decimal(15,3)", precision: 15, scale: 3, nullable: true),
                    ProgramDirective = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    RuleText = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CustomRules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CustomRules_Sensors_SensorId",
                        column: x => x.SensorId,
                        principalTable: "Sensors",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_CustomRules_SensorId",
                table: "CustomRules",
                column: "SensorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CustomRules");
        }
    }
}
