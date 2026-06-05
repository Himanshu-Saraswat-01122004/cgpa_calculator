import mongoose, { Schema, Document } from 'mongoose';

const CourseSchema = new Schema({
    courseName: { type: String, required: true },
    credits:    { type: Number, required: true },
    grade:      { type: String, required: true },
});

const SemesterSchema = new Schema({
    semesterName: { type: String, required: true },
    courses:      [CourseSchema],
});

export interface IUser extends Document {
    name:           string;
    email:          string;
    password?:      string;
    // College info
    college?:       string;
    department?:    string;
    rollNumber?:    string;
    batch?:         string;
    // Profile picture (base64 data URL, resized client-side)
    profilePicture?: string;
    // Resume (base64 PDF)
    resume?:         string;
    resumeName?:     string;
    semesters: {
        _id?:         mongoose.Types.ObjectId;
        semesterName: string;
        courses: {
            _id?:       mongoose.Types.ObjectId;
            courseName: string;
            credits:    number;
            grade:      string;
        }[];
    }[];
}

const UserSchema: Schema = new Schema({
    name:           { type: String, required: true },
    email:          { type: String, required: true, unique: true },
    password:       { type: String, required: true },
    college:        { type: String, default: '' },
    department:     { type: String, default: '' },
    rollNumber:     { type: String, default: '' },
    batch:          { type: String, default: '' },
    profilePicture: { type: String, default: '' },
    resume:         { type: String, default: '' },
    resumeName:     { type: String, default: '' },
    semesters:      [SemesterSchema],
});
// Force re-registration so new fields (resume, resumeName) are always picked up
// even after hot-reload in dev
delete (mongoose.models as Record<string, unknown>).User;
export default mongoose.model<IUser>('User', UserSchema);
