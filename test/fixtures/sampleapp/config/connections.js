module.exports.connections = {


    somePostgresqlServer: {
        user: 'iCesar',
        password: '',
        database: 'sequelize',
        dialect: 'postgres',
        options: {
            sync: 'force',
            dialect: 'postgres',
            host   : 'localhost',
            port   : 5432,
            logging: true
        }
    }
};
