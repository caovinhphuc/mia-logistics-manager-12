// User Service - Quản lý người dùng từ Google Sheets
import { googleSheetsService } from '../google/googleSheetsService';

export class User {
  constructor(data = {}) {
    this.id = data.id || '';
    this.username = data.username || '';
    this.email = data.email || '';
    // Accept both passwordHash and password_hash
    this.passwordHash = data.passwordHash || data.password_hash || '';
    this.fullName = data.fullName || data.full_name || data.name || '';
    this.phone = data.phone || '';
    this.avatarUrl = data.avatar_url || '';
    this.role = data.role || 'user';
    this.isActive =
      data.is_active === 'true' ||
      data.is_active === true ||
      data.isActive === 'true' ||
      data.isActive === true ||
      data.status === 'active' ||
      (data.is_active !== 'false' && data.is_active !== false);
    this.lastLogin = data.last_login || null;
    this.createdAt =
      data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt =
      data.updated_at || data.updatedAt || new Date().toISOString();
  }

  toGoogleSheets() {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      password_hash: this.passwordHash,
      full_name: this.fullName,
      phone: this.phone,
      avatar_url: this.avatarUrl,
      is_active: this.isActive.toString(),
      last_login: this.lastLogin || '',
      created_at: this.createdAt,
      updated_at: this.updatedAt,
    };
  }
}

export class UserService {
  constructor() {
    this.sheetName = 'Users';
    this.spreadsheetId =
      process.env.REACT_APP_GOOGLE_SPREADSHEET_ID ||
      '18B1PIhCDmBWyHZytvOcfj_1QbYBwczLf1x1Qbu0E5As';
  }

  async initialize() {
    try {
      console.log('🔄 Khởi tạo UserService...');
      await googleSheetsService.initializeAPI();
      googleSheetsService.spreadsheetId = this.spreadsheetId;
      console.log('✅ UserService đã khởi tạo');
    } catch (error) {
      console.error('❌ Lỗi khởi tạo UserService:', error);
      throw error;
    }
  }

  async getUsers() {
    try {
      // Kiểm tra nếu đang ở chế độ mock
      if (process.env.REACT_APP_USE_MOCK_DATA === 'true') {
        console.log('🔧 Mock mode: Sử dụng dữ liệu mock cho users');
        return this.getMockUsers();
      }

      await this.initialize();

      // Connect to Google Sheets if not already connected
      if (!googleSheetsService.isConnected) {
        console.log('🔄 Kết nối Google Sheets...');
        await googleSheetsService.connect(this.spreadsheetId);
      }

      console.log('🔄 Lấy dữ liệu từ Google Sheets...');
      const data = await googleSheetsService.getData(this.sheetName);

      if (!data || data.length <= 1) {
        throw new Error('Không có dữ liệu từ Google Sheets');
      }

      const headers = data[0];
      const users = data.slice(1).map((row, index) => {
        const userData = {};
        headers.forEach((header, colIndex) => {
          userData[header] = row[colIndex] || '';
        });

        // Map cấu trúc cột từ Google Sheets
        const mappedUserData = {
          id: userData.id || '',
          email: userData.email || '',
          name: userData.fullName || userData.name || '',
          role: userData.roleId || userData.role || 'user',
          status: userData.status || 'active',
          created_at: userData.createdAt || userData.created_at || '',
          updated_at: userData.updatedAt || userData.updated_at || '',
          passwordHash: userData.passwordHash || userData.password_hash || '',
        };

        // Đảm bảo status được xử lý đúng
        if (
          mappedUserData.status === undefined ||
          mappedUserData.status === ''
        ) {
          mappedUserData.status = 'active'; // Default to active
        }

        return new User(mappedUserData);
      });

      console.log(
        `📊 Lấy danh sách users từ Google Sheets: ${users.length} người dùng`
      );
      return users;
    } catch (error) {
      console.error('❌ Lỗi lấy danh sách users:', error);
      console.log('🔄 Fallback: Sử dụng dữ liệu mock...');
      return this.getMockUsers();
    }
  }

  async getUserById(userId) {
    try {
      const users = await this.getUsers();
      return users.find((user) => user.id === userId);
    } catch (error) {
      console.error('❌ Lỗi lấy user theo ID:', error);
      throw error;
    }
  }

  async getUserByUsername(username) {
    try {
      const users = await this.getUsers();
      return users.find((user) => user.username === username);
    } catch (error) {
      console.error('❌ Lỗi lấy user theo username:', error);
      throw error;
    }
  }

  async getUserByEmail(email) {
    try {
      const users = await this.getUsers();
      return users.find((user) => user.email === email);
    } catch (error) {
      console.error('❌ Lỗi lấy user theo email:', error);
      throw error;
    }
  }

  // Mock data cho testing với mật khẩu thực tế
  getMockUsers() {
    return [
      new User({
        id: 'u-admin',
        username: 'admin',
        email: 'admin@mia.vn',
        password_hash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        full_name: 'Administrator',
        phone: '0123456789',
        avatar_url: '',
        is_active: 'true',
        last_login: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'admin',
      }),
      new User({
        id: '2',
        username: 'manager1',
        email: 'manager@mia-logistics.com',
        password_hash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        full_name: 'Manager User',
        phone: '0123456788',
        avatar_url: '',
        is_active: 'true',
        last_login: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'manager',
      }),
      new User({
        id: '3',
        username: 'employee1',
        email: 'employee@mia-logistics.com',
        password_hash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        full_name: 'Employee User',
        phone: '0123456787',
        avatar_url: '',
        is_active: 'true',
        last_login: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'user',
      }),
      new User({
        id: '4',
        username: 'driver1',
        email: 'driver@mia-logistics.com',
        password_hash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        full_name: 'Driver User',
        phone: '0123456786',
        avatar_url: '',
        is_active: 'true',
        last_login: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'driver',
      }),
      new User({
        id: '5',
        username: 'warehouse1',
        email: 'warehouse@mia-logistics.com',
        password_hash:
          '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password: "password"
        full_name: 'Warehouse Staff',
        phone: '0123456785',
        avatar_url: '',
        is_active: 'true',
        last_login: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        role: 'warehouse_staff',
      }),
    ];
  }

  async createUser(userData) {
    try {
      await this.initialize();

      // Generate new ID
      const users = await this.getUsers();
      const newId = (
        Math.max(...users.map((u) => parseInt(u.id) || 0)) + 1
      ).toString();

      const user = new User({
        ...userData,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const userRow = user.toGoogleSheets();
      const values = Object.values(userRow);

      await googleSheetsService.appendData(this.sheetName, [values]);

      console.log(`✅ Đã tạo user mới: ${user.username}`);
      return user;
    } catch (error) {
      console.error('❌ Lỗi tạo user:', error);
      throw error;
    }
  }

  async updateUser(userId, updates) {
    try {
      await this.initialize();

      const users = await this.getUsers();
      const userIndex = users.findIndex((user) => user.id === userId);

      if (userIndex === -1) {
        throw new Error('Không tìm thấy user');
      }

      const updatedUser = new User({
        ...users[userIndex],
        ...updates,
        updated_at: new Date().toISOString(),
      });

      const userRow = updatedUser.toGoogleSheets();
      const values = Object.values(userRow);

      // Update row in Google Sheets (row index = userIndex + 2 because of header)
      await googleSheetsService.updateValues(
        this.sheetName,
        `A${userIndex + 2}:K${userIndex + 2}`,
        [values]
      );

      console.log(`✅ Đã cập nhật user: ${updatedUser.username}`);
      return updatedUser;
    } catch (error) {
      console.error('❌ Lỗi cập nhật user:', error);
      throw error;
    }
  }

  async deleteUser(userId) {
    try {
      await this.initialize();

      const users = await this.getUsers();
      const userIndex = users.findIndex((user) => user.id === userId);

      if (userIndex === -1) {
        throw new Error('Không tìm thấy user');
      }

      // Delete row in Google Sheets (row index = userIndex + 2 because of header)
      await googleSheetsService.deleteData(
        this.sheetName,
        `A${userIndex + 2}:K${userIndex + 2}`
      );

      console.log(`✅ Đã xóa user: ${userId}`);
      return true;
    } catch (error) {
      console.error('❌ Lỗi xóa user:', error);
      throw error;
    }
  }

  async updateLastLogin(userId) {
    try {
      // Tạm thời disable cập nhật Google Sheets vì lỗi API
      console.log(
        `ℹ️ Bỏ qua cập nhật last_login cho user ${userId} - Google Sheets API error`
      );
      return true;

      // Code cũ (đã comment):
      // await this.updateUser(userId, {
      //   last_login: new Date().toISOString()
      // });
    } catch (error) {
      console.error('❌ Lỗi cập nhật last login:', error);
      // Không throw error để không làm gián đoạn login
      console.log('ℹ️ Tiếp tục login mặc dù không cập nhật được last_login');
    }
  }

  async getActiveUsers() {
    try {
      const users = await this.getUsers();
      return users.filter((user) => user.isActive);
    } catch (error) {
      console.error('❌ Lỗi lấy active users:', error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const users = await this.getUsers();
      const activeUsers = users.filter((user) => user.isActive);

      return {
        total: users.length,
        active: activeUsers.length,
        inactive: users.length - activeUsers.length,
        recentLogins: users.filter((user) => {
          if (!user.lastLogin) return false;
          const lastLogin = new Date(user.lastLogin);
          const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return lastLogin > oneWeekAgo;
        }).length,
      };
    } catch (error) {
      console.error('❌ Lỗi lấy thống kê users:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
