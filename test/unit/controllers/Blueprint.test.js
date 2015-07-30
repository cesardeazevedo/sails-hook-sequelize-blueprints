var request = require('supertest');
var should  = require('should');
var user = {};
var userEdited = {};

describe('Sequelize Blueprint User', function(){

    before(function(){
        user = {
            name: 'Tester',
            age: 21
        };

        userEdited = {
            name: 'TesterEdited'
        };
    });

    it('Get users', function(done){
        request(sails.hooks.http.app)
        .get('/user')
        .expect(200)
        .end(function(err, response){
            sails.log(response.body);
            done();
        });
    });

    it('Create an user', function(done){
        request(sails.hooks.http.app)
        .post('/user')
        .send(user)
        .expect(201)
        .end(function(err, response){
            if(err) {
                return done(err);
            }

            response.body.should.be.type('object').and.have.property('name', 'Tester');
            user.id = response.body.id;
            done();
        });
    });

    it('Update an user', function(done){
        request(sails.hooks.http.app)
        .put('/user/'+user.id)
        .send(userEdited)
        .expect(200)
        .end(function(err, response){
            if(err) {
                return done(err);
            }

            response.body.should.be.type('object').and.have.property('name', 'TesterEdited');
            user.id = response.body.id;
            done();
        });
    });

    it('Delete an user', function(done){
        request(sails.hooks.http.app)
        .delete('/user/'+user.id)
        .expect(200, done);
    });
});


describe('Sequelize Blueprint Images', function(){

    it('Create an user', function(done){
        request(sails.hooks.http.app)
        .post('/user')
        .send({ name: 'UserImage', age: 25 })
        .expect(201)
        .end(function(err, response){
            if(err){
                sails.log(err);
                sails.log(response.body);
                return done(new Error(err));
            }

            sails.log(response.body);
            done();
        });
    });

    it('Create an image for the user', function(done){
        request(sails.hooks.http.app)
        .post('/image')
        .send({ url: 'http:image.com/images.png', owner: 2 })
        .expect(201, done);
    });

    it('Get users', function(done){
        request(sails.hooks.http.app)
        .get('/user')
        .expect(200)
        .end(function(err, response){
            sails.log(response.body);
            done();
        });
    });

    // it('Create an image without an owner', function(done){
        // request(sails.hooks.http.app)
        // .post('/image')
        // .send({ url: 'http:image.com/images.png' })
        // .expect(500, done);
    // });
});
