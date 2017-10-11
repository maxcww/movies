const chai = require("chai");
const chaiHttp = require("chai-http");
const should = chai.should();

chai.use(chaiHttp);

const PORT = process.env.APP_PORT;
const HOST = process.env.HOST;
const link = `http://${HOST}:${PORT}`;

describe("Testing API", function() {
  describe("/GET locations", function() {
    it("should GET all locations", function(done) {
      chai
        .request(link)
        .get("/locations")
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.an("array");
          res.body[0].should.have.property("name");
          done();
        });
    });
  });

  describe("/GET columns :location", function() {
    it("should GET columns of San Francisco", function(done) {
      chai
        .request(link)
        .get("/columns/San%20Francisco")
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.an("array");
          res.body.should.satisfy(function(columns) {
            let found = false;
            columns.forEach(column => {
              if (column === "Locations" || column === "locations")
                found = true;
            });
            return found;
          });
          done();
        });
    });

    it("should not GET columns of Somewhere", function(done) {
      chai
        .request(link)
        .get("/columns/Somewhere")
        .end((err, res) => {
          res.should.have.status(500);
          should.exist(err);
          done();
        });
    });
  });

  describe("/POST movies :location", function() {
    it("should POST for San Francisco and get movies", function(done) {
      chai
        .request(link)
        .post("/movies/San%20Francisco")
        .set("content-type", "application/json")
        .send({
          columns: [
            "Title",
            "Release Year",
            "Locations",
            "Fun Facts",
            "Production Company",
            "Distributor",
            "Director",
            "Writer",
            "Actor 1",
            "Actor 2",
            "Actor 3"
          ],
          values: ["", "", "", "", "", "", "", "", "", "", ""]
        })
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.an("array");
          res.body[0].should.have.property("Geocode");
          res.body[0]["Geocode"].should.have.property("lat");
          res.body[0]["Geocode"].should.have.property("lng");
          done();
        });
    });

    it("should not POST without columns and values for San Francisco", function(
      done
    ) {
      chai
        .request(link)
        .post("/movies/San%20Francisco")
        .set("content-type", "application/json")
        .send({})
        .end((err, res) => {
          res.should.have.status(500);
          should.exist(err);
          done();
        });
    });

    it("should POST with wrong location and get empty array", function(done) {
      chai
        .request(link)
        .post("/movies/Somewhere")
        .set("content-type", "application/json")
        .send({
          columns: [
            "Title",
            "Release Year",
            "Locations",
            "Fun Facts",
            "Production Company",
            "Distributor",
            "Director",
            "Writer",
            "Actor 1",
            "Actor 2",
            "Actor 3"
          ],
          values: ["", "", "", "", "", "", "", "", "", "", ""]
        })
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.an("array");
          done();
        });
    });

    it("should POST with empty columns and values for San Francisco and get\
         movies", function(
      done
    ) {
      chai
        .request(link)
        .post("/movies/San%20Francisco")
        .set("content-type", "application/json")
        .send({
          columns: [],
          values: []
        })
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.an("array");
          res.body[0].should.have.property("Geocode");
          res.body[0]["Geocode"].should.have.property("lat");
          res.body[0]["Geocode"].should.have.property("lng");
          done();
        });
    });
  });

  describe("/POST suggestions :location", function() {
    it("should POST for San Francisco and get suggestions", function(done) {
      chai
        .request(link)
        .post("/suggestions/San%20Francisco")
        .set("content-type", "application/json")
        .send({
          columns: [
            "Title",
            "Release Year",
            "Locations",
            "Fun Facts",
            "Production Company",
            "Distributor",
            "Director",
            "Writer",
            "Actor 1",
            "Actor 2",
            "Actor 3"
          ],
          values: ["", "", "", "", "", "", "", "", "", "", ""],
          index: 1
        })
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.an("object");
          res.body.should.have.property("suggestions");
          res.body.suggestions.should.be.an("array");
          done();
        });
    });

    it("should POST with wrong index for San Francisco and get suggestions", 
      function(done
    ) {
      chai
        .request(link)
        .post("/suggestions/San%20Francisco")
        .set("content-type", "application/json")
        .send({
          columns: [
            "Title",
            "Release Year",
            "Locations",
            "Fun Facts",
            "Production Company",
            "Distributor",
            "Director",
            "Writer",
            "Actor 1",
            "Actor 2",
            "Actor 3"
          ],
          values: ["", "", "", "", "", "", "", "", "", "", ""],
          index: 13
        })
        .end((err, res) => {
          res.should.have.status(200);
          should.not.exist(err);
          res.body.should.be.an("object");
          res.body.should.have.property("suggestions");
          done();
        });
    });

    it("should not POST without columns and values for San Francisco", function(
      done
    ) {
      chai
        .request(link)
        .post("/suggestions/San%20Francisco")
        .set("content-type", "application/json")
        .send({ index: 1 })
        .end((err, res) => {
          res.should.have.status(500);
          should.exist(err);
          done();
        });
    });
  });
});
