import UserModel from '../../dao/models/user.model.js';

class UserRepository {
  async findByEmail(email) {
    return UserModel.findOne({ email });
  }

  async findById(id) {
    return UserModel.findById(id).exec();
  }

  async create(user) {
    return UserModel.create(user);
  }

  async update(id, updatedData) {
    return UserModel.findByIdAndUpdate(id, updatedData, { new: true }).exec();
  }

  async delete(id) {
    return UserModel.findByIdAndDelete(id).exec();
  }

}

export default UserRepository;
