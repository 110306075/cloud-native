import { Sequelize } from "sequelize";

export default (sequelize, DataTypes) => {
  const Exam = sequelize.define(
    "Exam",
    {
      ID: {
        type: DataTypes.UUID,
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
      },
      Name: { type: DataTypes.STRING(100), allowNull: false },
      StartDate: { type: DataTypes.DATE, allowNull: false },
      DueDate: { type: DataTypes.DATE, allowNull: false },
      Description: { type: DataTypes.TEXT, allowNull: true },
      CourseID: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: "Course", key: "ID" },
        onDelete: "CASCADE",
      },
      CreatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
      UpdatedAt: { type: DataTypes.DATE, defaultValue: Sequelize.NOW },
      DeletedAt: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "Exam",
      timestamps: false,
    }
  );
  return Exam;
};
