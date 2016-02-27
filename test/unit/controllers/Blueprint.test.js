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

    it('Create a pet', function(done){
        request(sails.hooks.http.app)
        .post('/pet')
        .send({ name: 'Max', breed: 'bulldog', userId: user.id })
        .expect(201)
        .end(function(err, response){
            if(err) {
                return done(err);
            }

            response.body.should.be.type('object').and.have.property('name', 'Max');
            done();
        });
    });

    it('Should update user name and populate all relations', function(done){
        request(sails.hooks.http.app)
        .put('/user/'+user.id)
        .send({ name: 'TesterEdited' })
        .expect(200)
        .end(function(err, response){
            if(err) {
                return done(err);
            }

            response.body.should.be.type('object').and.have.property('name', 'TesterEdited');
            response.body.should.be.type('object').and.have.property('pets');
            response.body.should.be.type('object').and.have.property('images');
            user.id = response.body.id;
            done();
        });
    });

    it('Should update a user and not return relations', function(done){
        sails.config.blueprints.populate = false;

        request(sails.hooks.http.app)
        .put('/user/'+user.id)
        .send({ name: 'TesterEdited 2' })
        .expect(200)
        .end(function(err, response){
            if(err) {
                return done(err);
            }

            response.body.should.be.type('object').and.have.property('name', 'TesterEdited 2');
            response.body.should.be.type('object').and.not.have.property('pets');
            response.body.should.be.type('object').and.not.have.property('images');
            user.id = response.body.id;

            sails.config.blueprints.populate = true;
            done();
        });
    })

    it('Create an image for the user', function(done){
        request(sails.hooks.http.app)
        .post('/image')
        .send({ url: 'http:image.com/images.png', userId: 1 })
        .expect(201, done);
    });

    it('Get users', function(done){
        request(sails.hooks.http.app)
        .get('/user')
        .expect(200, done);
    });

    it('Get single user', function(done){
        request(sails.hooks.http.app)
        .get('/user/1')
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
        .send({ url: 'a.png' })
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

    it('Get an sigle image from a user', function(done){
        request(sails.hooks.http.app)
        .get('/user/1/images/1')
        .expect(200)
        .end(function(err, response){
            if(err)
                return done(err);

            response.body.should.have.length(1);
            response.body[0].should.have.a.property('url');
            done();
        });
    });

    it('List images sorted by url', function(done){
        request(sails.hooks.http.app)
        .get('/user/1/images/?sort=url')
        .expect(200)
        .end(function(err, response){
            if(err)
                return done(err);

            response.body[0].url.should.be.exactly('a.png');
            done();
        });
    });

    it('List images with limit', function(done){
        request(sails.hooks.http.app)
        .get('/user/1/images/?limit=1')
        .expect(200)
        .end(function(err, response){
            if(err)
                return done(err);

            response.body.should.have.length(1);
            done();
        });
    });

    it('List image owner', function(done){
        request(sails.hooks.http.app)
        .get('/image/1/owner')
        .expect(200, done);
    });

    it('Populate pet', function(done){
        request(sails.hooks.http.app)
        .get('/user/?populate=pet')
        .expect(200)
        .end(function(err, response){
          if(err)
            return done(err);

          response.body[0].should.have.property('pets');
          done();
        });
    });

    it('Populate user from pet', function(done){
        request(sails.hooks.http.app)
        .get('/pet?populate=user')
        .expect(200)
        .end(function(err, response){
          if(err)
            return done(err);

          response.body[0].should.have.property('owner');
          done();
        });
    });

    it('Populate pet and image', function(done){
        request(sails.hooks.http.app)
        .get('/user/?populate=[pet,image]')
        .expect(200)
        .end(function(err, response){
          if(err)
            return done(err);

          response.body[0].should.have.property('pets');
          response.body[0].should.have.property('images');
          done();
        });
    });

    it('Should get a user and not return relations', function(done){
        sails.config.blueprints.populate = false;

        request(sails.hooks.http.app)
        .get('/user')
        .expect(200)
        .end(function(err, response){
          if(err)
            return done(err);

          response.body[0].should.not.have.property('pets');
          response.body[0].should.not.have.property('images');

          sails.config.blueprints.populate = true;
          done();
        });
    });


    it('Remove an image from a user without relations', function(done){
        sails.config.blueprints.populate = false;

        request(sails.hooks.http.app)
        .delete('/user/1/images/remove/1')
        .expect(200)
        .end(function(err, response){
          if(err)
            return done(err);

          response.body.should.not.have.property('images');
          response.body.should.not.have.property('pets');

          sails.config.blueprints.populate = true;
          done();
        });
    });

    it('Should delete a pet without return the owner', function(done){
        sails.config.blueprints.populate = false;

        request(sails.hooks.http.app)
        .delete('/pet/1')
        .expect(200)
        .end(function(err, response){
          if(err)
            return done(err);

          response.body.should.not.have.property('owner');

          sails.config.blueprints.populate = true;
          done();
        });
    });

    it('Delete an user and return the deleted record with all relations', function(done){
        sails.config.blueprints.populate = true;

        request(sails.hooks.http.app)
        .delete('/user/1')
        .expect(200)
        .end(function(err, response){
          if(err)
            return done(err);

          response.body.should.have.property('pets');
          response.body.should.have.property('images');

          done();
        });
    });
});
