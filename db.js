const Sequelize = require('sequelize');
const { UUID, UUIDV4, STRING } = Sequelize;
const conn = new Sequelize(process.env.DATABASE_URL || 'postgres://localhost/my_db');
const jwt = require('jwt-simple')

const User = conn.define('user', {
  id: {
    type: UUID,
    defaultValue: UUIDV4,
    primaryKey: true 
  },
  email: {
    type: STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: STRING,
    allowNull: false
  }
});

User.authenticate = async (credentials) =>{
  const {email, password} = credentials
  const user = await User.findOne({where:{email,password}})
  if(user){
    return jwt.encode({id:user.id}, process.env.SECRET)
  }
  throw ({status:401})
}

User.findByToken = (token) => {
  const _user = jwt.decode(token,process.env.SECRET)
  User.findOne({where:{id}})
  console.log()
}

const syncAndSeed = async()=> {
  await conn.sync({ force: true });
  const users = [
    { name: 'moe' },
    { name: 'larry' },
    { name: 'lucy' },
    { name: 'ethyl' }
  ];
  const [moe, larry, lucy, ethyl] = await Promise.all(
      users.map( user => User.create({ email: `${user.name}@gmail.com`, password: user.name.toUpperCase()}))
  );
};

module.exports = {
  models: {
    User
  },
  syncAndSeed
};