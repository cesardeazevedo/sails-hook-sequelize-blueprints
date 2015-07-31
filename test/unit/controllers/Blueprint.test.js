var request = require('supertest');
var should  = require('should');

describe('Sequelize Blueprint User', function(){

    it('Get users', function(done){
        request(sails.hooks.http.app)
        .get('/user')
        .expect(200, done);
    });

    it('Create a user', function(done){
        request(sails.hooks.http.app)
        .post('/user')
        .send({ name: 'Tester', age: 21 })
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

    it('Update a user', function(done){
        request(sails.hooks.http.app)
        .put('/user/'+user.id)
        .send({ name: 'TesterEdited' })
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


    it('Create an image for the user', function(done){
        request(sails.hooks.http.app)
        .post('/image')
        .send({ url: 'http:image.com/images.png', owner: 1 })
        .expect(201, done);
    });

    it('Get users', function(done){
        request(sails.hooks.http.app)
        .get('/user')
        .expect(200, done);
    });

    it('Create an image without an owner', function(done){
        request(sails.hooks.http.app)
        .post('/image')
        .send({ url: 'http:image.com/images.png' })
        .expect(500, done);
    });

    it('Add an image to a user', function(done){
        request(sails.hooks.http.app)
        .post('/user/1/images/add')
        .send({ url: 'http:imageadded.com/image.png' })
        .expect(200)
        .end(function(err, response){
            if(err)
                return done(err);

            response.body.images.should.be.an.instanceOf(Array);
            done();
        });
    });

    it('Get images from a user', function(done){
        request(sails.hooks.http.app)
        .get('/user/1/images')
        .expect(200)
        .end(function(err, response){
            if(err)
                return done(err);

            response.body.should.be.an.instanceOf(Array);
            done();
        });
    });

    it('Remove an image from a user', function(done){
        request(sails.hooks.http.app)
        .delete('/user/1/images/remove/1')
        .expect(200)
        .end(done);
    });

    it('Delete an user', function(done){
        request(sails.hooks.http.app)
        .delete('/user/1')
        .expect(200, done);
    });
});
