import db from "../../../models/index.js";
import { Op, Sequelize } from "sequelize";

const {
  UserCourse,
  User,
  Course,
  Assignment,
  Submission,
  Exam,
  Question,
  TestCase,
  sequelize,
} = db;
export const getCoursesByTeacher = async (req, res) => {
  try {
    const user = req.user;
    const teacherId = user.id;
    const userCourses = await UserCourse.findAll({
      where: { UserID: teacherId, DeletedAt: null },
      include: {
        model: Course,
        attributes: ["ID", "Name", "Semester", "StudentLimit", "StudentCount"],
        where: { DeletedAt: null },
      },
      order: [[{ model: Course }, "Semester", "DESC"]],
    });

    const courses = await Promise.all(
      userCourses.map(async (uc) => {
        const courseId = uc.CourseID;

        const totalAssignments = await Assignment.count({
          where: {
            CourseID: courseId,
            DeletedAt: null,
          },
        });

        const completedAssignments = await Assignment.count({
          where: {
            CourseID: courseId,
            DeletedAt: null,
            DueDate: { [Op.lt]: new Date() },
          },
        });

        const activeExams = await Exam.count({
          where: {
            CourseID: courseId,
            DeletedAt: null,
            StartDate: { [Op.lte]: new Date() },
            DueDate: { [Op.gte]: new Date() },
          },
        });

        return {
          id: courseId,
          name: uc.Course?.Name || "Unknown",
          semester: uc.Course?.Semester || "Unknown",
          student_limit: uc.Course?.StudentLimit || null,
          total_assignments: totalAssignments,
          completed_assignments: completedAssignments,
          active_exams: activeExams,
        };
      })
    );

    res.status(200).json({
      courses,
    });
  } catch (error) {
    console.error("Error fetching courses by student ID:", error);
    res.status(500).json({ error: error.message });
  }
};

export const createCourse = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { course_name, semester, student_limit } = req.body;
    const teacherID = req.user.id;

    const user = await User.findOne({
      where: { ID: teacherID, DeletedAt: null },
    });
    if (!req.user || user.Type !== "teacher") {
      return res
        .status(403)
        .json({ error: "Only teachers can create courses." });
    }
    const existingCourse = await Course.findOne({
      where: { Semester: semester, Name: course_name, DeletedAt: null },
    });
    if (existingCourse) {
      return res.status(400).json({
        error: `The course  ${course_name} is already exist in semester ${semester}.`,
      });
    }

    const newCourse = await Course.create(
      {
        Name: course_name,
        Semester: semester,
        StudentLimit: student_limit,
      },
      { transaction: transaction }
    );

    await UserCourse.create(
      {
        UserID: teacherID,
        CourseID: newCourse.ID,
      },
      { transaction: transaction }
    );
    await transaction.commit();
    res.status(201).end();
  } catch (error) {
    await transaction.rollback();
    console.error("Error creating course:", error);
    res.status(500).json({ error: "Failed to create course." });
  }
};

export const deleteCourse = async (req, res) => {
  const { courseID } = req.params;
  const transaction = await Course.sequelize.transaction();

  try {
    const courseResult = await Course.update(
      { DeletedAt: Sequelize.fn("NOW") },
      { where: { ID: courseID, DeletedAt: null }, transaction: transaction }
    );

    if (courseResult[0] === 0) {
      await transaction.rollback();
      return res
        .status(500)
        .json({ error: "error occur when deleting course." });
    }

    await Assignment.update(
      { DeletedAt: Sequelize.fn("NOW") },
      {
        where: { CourseID: courseID, DeletedAt: null },
        transaction: transaction,
      }
    );

    await Exam.update(
      { DeletedAt: Sequelize.fn("NOW") },
      {
        where: { CourseID: courseID, DeletedAt: null },
        transaction: transaction,
      }
    );
    await UserCourse.update(
      { DeletedAt: Sequelize.fn("NOW") },
      {
        where: { CourseID: courseID, DeletedAt: null },
        transaction: transaction,
      }
    );

    await transaction.commit();

    res.status(200).end();
  } catch (error) {
    await transaction.rollback();
    console.error("Error deleting course:", error);
    return res.status(500).json({ error: "error occur when deleting course." });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const { courseID } = req.params;
    const updatedData = req.body;

    const excludedFields = ["ID", "CreatedAt", "DeletedAt", "UpdatedAt"];

    const filteredData = {};
    Object.keys(updatedData).forEach((key) => {
      if (!excludedFields.includes(key)) {
        filteredData[key] = updatedData[key];
      }
    });

    filteredData.UpdatedAt = new Date();

    const [affectedRows] = await Course.update(filteredData, {
      where: { ID: courseID, DeletedAt: null },
    });

    if (affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Course not found or already deleted." });
    }

    return res.status(200).json({ message: "Course updated successfully." });
  } catch (error) {
    console.error("Error updating course:", error);
    return res
      .status(500)
      .json({ message: "An error occurred while updating the course." });
  }
};
