import { expect } from 'chai';
import supertest from 'supertest';
import sinon from 'sinon';
import axios from 'axios';
import server from './server.js';

const request = supertest(server);

describe('Book Search API', () => {
  let axiosGetStub;

  after((done) => { 
    server.close(done);
  });

  beforeEach(() => {
    // Stub the axios.get method before each test
    axiosGetStub = sinon.stub(axios, 'get');
  });

  afterEach(() => {
    // Restore the original axios.get method after each test
    axiosGetStub.restore();
  });

  it('should return books and statistics for a valid query', (done) => {
    // Define the mocked response data
    const mockResponse = {
      data: [
        { title: 'Mystery Book 1', author: 'sree', yearPublished: 2020 },
        { title: 'Mystery Book 2', author: 'Gabriel García Márquez', yearPublished: 2021 },
      ],
    };

    // Mock axios.get to return the above mockResponse
    axiosGetStub.resolves(mockResponse);

    request
      .get('/api/search')
      .query({ query: 'mystery' })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('books').that.is.an('array');
        expect(res.body.books).to.have.lengthOf(2);
        expect(res.body).to.have.property('statistics').that.is.an('object');
        done();
      });
  });

  it('should return books and statistics for a empty query', (done) => {
    const mockResponse = {
      data: [
        { title: 'Mystery Book 1', author: 'sree', yearPublished: 2020 },
        { title: 'Mystery Book 2', author: 'Gabriel García Márquez', yearPublished: 2021 },
      ],
    };

    // Mock axios.get to return the above mockResponse
    axiosGetStub.resolves(mockResponse);

    request
      .get('/api/search')
      .query({ query: '' })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('books').that.is.an('array');
        expect(res.body.books).to.have.lengthOf(2); // Assert there are two books
        expect(res.body).to.have.property('statistics').that.is.an('object');
        done();
      });
  });

  it('should handle the case where there are no books', (done) => {
    const mockResponse = {
      data: [
      ],
    };

    // Mock axios.get to return the above mockResponse
    axiosGetStub.resolves(mockResponse);
    request
      .get('/api/search')
      .query({ query: 'nonexistent' })
      .end((err, res) => {
        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('books').that.is.an('array').that.is.empty;
        done();
      });
  });

  it('should return a 500 error if axios request fails', (done) => {
    // Mock axios.get to throw an error
    axiosGetStub.rejects(new Error('API request failed'));

    request
      .get('/api/search')
      .query({ query: 'mystery' })
      .end((err, res) => {
        expect(res.status).to.equal(500); // Assert the error status
        expect(res.body).to.have.property('error').that.equals('Failed to fetch books');
        done();
      });
  });
});