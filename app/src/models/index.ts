import User from "./user.model";
import Role from "./role.model";
import EmailVerificationToken from "./email-verification-model";

Role.hasMany(User, { foreignKey: 'role_id'});
User.belongsTo(Role, { foreignKey: 'roleId'});

User.hasMany(EmailVerificationToken, {foreignKey: 'userId'});
EmailVerificationToken.belongsTo(User, {foreignKey: 'userId'});

export { User, Role, EmailVerificationToken };