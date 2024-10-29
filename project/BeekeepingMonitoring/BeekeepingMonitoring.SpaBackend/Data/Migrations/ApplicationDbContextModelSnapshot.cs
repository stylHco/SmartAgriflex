﻿// <auto-generated />
using System;
using BeekeepingMonitoring.SpaBackend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace BeekeepingMonitoring.SpaBackend.Data.Migrations
{
    [DbContext(typeof(ApplicationDbContext))]
    partial class ApplicationDbContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.0")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Data.AssociationRuleRecord", b =>
                {
                    b.Property<double>("Confidence")
                        .HasColumnType("float")
                        .HasColumnName("CONF");

                    b.Property<string>("LeftHand")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("_LHAND");

                    b.Property<double>("Lift")
                        .HasColumnType("float")
                        .HasColumnName("LIFT");

                    b.Property<int>("Relations")
                        .HasColumnType("int")
                        .HasColumnName("SET_SIZE");

                    b.Property<string>("RightHand")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("_RHAND");

                    b.Property<string>("Rule")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)")
                        .HasColumnName("RULE");

                    b.Property<double>("Support")
                        .HasColumnType("float")
                        .HasColumnName("SUPPORT");

                    b.ToTable("MinerAssocRules", null, t =>
                        {
                            t.ExcludeFromMigrations();
                        });
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Data.SalesRecord", b =>
                {
                    b.Property<int>("AreaId")
                        .HasColumnType("int")
                        .HasColumnName("AREA_ID");

                    b.Property<string>("AreaName")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("AREA_NAME");

                    b.Property<string>("Brand")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("BRAND");

                    b.Property<int>("CategoryId")
                        .HasColumnType("int")
                        .HasColumnName("CATEGORY_ID");

                    b.Property<string>("CategoryName")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("CATEGORY_NAME");

                    b.Property<int>("Day")
                        .HasColumnType("int")
                        .HasColumnName("DAY");

                    b.Property<string>("Diet")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("DIET");

                    b.Property<int>("Month")
                        .HasColumnType("int")
                        .HasColumnName("MONTH");

                    b.Property<int>("OutletId")
                        .HasColumnType("int")
                        .HasColumnName("OUTLET_ID");

                    b.Property<string>("OutletName")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("OUTLET_NAME");

                    b.Property<int>("OutletTypeId")
                        .HasColumnType("int")
                        .HasColumnName("OUTLET_TYPE_ID");

                    b.Property<string>("OutletTypeName")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("OUTLET_TYPE_NAME");

                    b.Property<int>("PAreaId")
                        .HasColumnType("int")
                        .HasColumnName("PAREA_ID");

                    b.Property<string>("PackType")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("PACK_TYPE");

                    b.Property<double?>("Price")
                        .HasColumnType("float")
                        .HasColumnName("M_PRICE");

                    b.Property<int>("ProductId")
                        .HasColumnType("int")
                        .HasColumnName("PRODUCT_ID");

                    b.Property<string>("ProductName")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("PRODUCT_NAME");

                    b.Property<string>("Promotion")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("PROMOTION");

                    b.Property<double>("Quantity")
                        .HasColumnType("float")
                        .HasColumnName("M_QUANTITY");

                    b.Property<int>("Quarter")
                        .HasColumnType("int")
                        .HasColumnName("QUARTER");

                    b.Property<double?>("SalesValue")
                        .HasColumnType("float")
                        .HasColumnName("M_SALES_VALUE");

                    b.Property<double>("SalesVolume")
                        .HasColumnType("float")
                        .HasColumnName("M_SALES_VOLUME");

                    b.Property<double>("Size")
                        .HasColumnType("float")
                        .HasColumnName("M_SIZE");

                    b.Property<string>("UrbanRural")
                        .IsRequired()
                        .HasMaxLength(150)
                        .HasColumnType("nvarchar(150)")
                        .HasColumnName("URBAN_RURAL");

                    b.Property<int>("Year")
                        .HasColumnType("int")
                        .HasColumnName("YEAR");

                    b.ToTable("Sales", (string)null);
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Dashboard.ConfigurableDashboard", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.HasKey("Id");

                    b.ToTable("ConfigurableDashboards");
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Dashboard.ConfigurableDashboardTile", b =>
                {
                    b.Property<long>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("bigint");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<long>("Id"));

                    b.Property<int>("ConfigurableDashboardId")
                        .HasColumnType("int");

                    b.Property<int>("Height")
                        .HasColumnType("int");

                    b.Property<int>("Type")
                        .HasColumnType("int");

                    b.Property<int>("Width")
                        .HasColumnType("int");

                    b.Property<int>("X")
                        .HasColumnType("int");

                    b.Property<int>("Y")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ConfigurableDashboardId");

                    b.ToTable("ConfigurableDashboardTiles");
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Dashboard.SalesByYearBoxplotData", b =>
                {
                    b.Property<int>("Count")
                        .HasColumnType("int");

                    b.Property<double>("Max")
                        .HasColumnType("float");

                    b.Property<double>("Median")
                        .HasColumnType("float");

                    b.Property<double>("Min")
                        .HasColumnType("float");

                    b.Property<double>("Q1")
                        .HasColumnType("float");

                    b.Property<double>("Q3")
                        .HasColumnType("float");

                    b.Property<double>("TotalVolume")
                        .HasColumnType("float");

                    b.Property<int>("Year")
                        .HasColumnType("int");

                    b.ToTable("_______NON_EXISTING_TABLE_BeekeepingMonitoring.SpaBackend.Features.Dashboard.SalesByYearBoxplotData", null, t =>
                        {
                            t.ExcludeFromMigrations();
                        });
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Dashboard.SalesByYearOutlierData", b =>
                {
                    b.Property<double>("Value")
                        .HasColumnType("float");

                    b.Property<int>("Year")
                        .HasColumnType("int");

                    b.ToTable("_______NON_EXISTING_TABLE_BeekeepingMonitoring.SpaBackend.Features.Dashboard.SalesByYearOutlierData", null, t =>
                        {
                            t.ExcludeFromMigrations();
                        });
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Devices.Device", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<DateTime?>("InstalledDate")
                        .HasColumnType("datetime2");

                    b.Property<decimal?>("Latitude")
                        .HasPrecision(15, 3)
                        .HasColumnType("decimal(15,3)");

                    b.Property<decimal?>("Longitude")
                        .HasPrecision(15, 3)
                        .HasColumnType("decimal(15,3)");

                    b.Property<string>("Model")
                        .HasMaxLength(250)
                        .HasColumnType("nvarchar(250)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("Nickname")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("Uid")
                        .HasMaxLength(250)
                        .HasColumnType("nvarchar(250)");

                    b.HasKey("Id");

                    b.HasIndex("Uid")
                        .IsUnique()
                        .HasFilter("[Uid] IS NOT NULL");

                    b.ToTable("Devices");
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Identity.ApplicationUser", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.SensorDeviceDatas.SensorDeviceData", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("RecordDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("SensorDeviceId")
                        .HasColumnType("int");

                    b.Property<decimal?>("Value")
                        .HasPrecision(15, 3)
                        .HasColumnType("decimal(15,3)");

                    b.HasKey("Id");

                    b.HasIndex("SensorDeviceId");

                    b.ToTable("SensorDeviceDatas");
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.SensorDevices.SensorDevice", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Comments")
                        .HasMaxLength(250)
                        .HasColumnType("nvarchar(250)");

                    b.Property<int>("DeviceId")
                        .HasColumnType("int");

                    b.Property<int>("SensorId")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("DeviceId");

                    b.HasIndex("SensorId");

                    b.ToTable("SensorDevices");
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Sensors.Sensor", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("Description")
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(500)
                        .HasColumnType("nvarchar(500)");

                    b.HasKey("Id");

                    b.ToTable("Sensors");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<System.Guid>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<System.Guid>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<Guid>("UserId")
                        .HasColumnType("uniqueidentifier");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<System.Guid>", b =>
                {
                    b.Property<Guid>("UserId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Dashboard.ConfigurableDashboardTile", b =>
                {
                    b.HasOne("BeekeepingMonitoring.SpaBackend.Features.Dashboard.ConfigurableDashboard", "Dashboard")
                        .WithMany("Tiles")
                        .HasForeignKey("ConfigurableDashboardId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.OwnsOne("BeekeepingMonitoring.SpaBackend.Features.Dashboard.PredefinedVisualizationTileOptions", "PredefinedVisualizationOptions", b1 =>
                        {
                            b1.Property<long>("ConfigurableDashboardTileId")
                                .HasColumnType("bigint");

                            b1.Property<int>("Type")
                                .HasColumnType("int");

                            b1.HasKey("ConfigurableDashboardTileId");

                            b1.ToTable("ConfigurableDashboardTiles");

                            b1.WithOwner()
                                .HasForeignKey("ConfigurableDashboardTileId");
                        });

                    b.Navigation("Dashboard");

                    b.Navigation("PredefinedVisualizationOptions");
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.SensorDeviceDatas.SensorDeviceData", b =>
                {
                    b.HasOne("BeekeepingMonitoring.SpaBackend.Features.SensorDevices.SensorDevice", "SensorDevice")
                        .WithMany()
                        .HasForeignKey("SensorDeviceId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("SensorDevice");
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.SensorDevices.SensorDevice", b =>
                {
                    b.HasOne("BeekeepingMonitoring.SpaBackend.Features.Devices.Device", "Device")
                        .WithMany()
                        .HasForeignKey("DeviceId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("BeekeepingMonitoring.SpaBackend.Features.Sensors.Sensor", "Sensor")
                        .WithMany()
                        .HasForeignKey("SensorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Device");

                    b.Navigation("Sensor");
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<System.Guid>", b =>
                {
                    b.HasOne("BeekeepingMonitoring.SpaBackend.Features.Identity.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<System.Guid>", b =>
                {
                    b.HasOne("BeekeepingMonitoring.SpaBackend.Features.Identity.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<System.Guid>", b =>
                {
                    b.HasOne("BeekeepingMonitoring.SpaBackend.Features.Identity.ApplicationUser", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("BeekeepingMonitoring.SpaBackend.Features.Dashboard.ConfigurableDashboard", b =>
                {
                    b.Navigation("Tiles");
                });
#pragma warning restore 612, 618
        }
    }
}
