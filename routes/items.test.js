const request = require("supertest");

const server = require("../server");
const testUtils = require('../test-utils');

const User = require('../models/user');
const Item = require('../models/item');

describe("/items", () => {
  beforeAll(testUtils.connectDB);
  afterAll(testUtils.stopDB);

  afterEach(testUtils.clearDB);

  const item0 = { title: 'Item One', price: 10 };
  const item1 = { title: 'Second Item', price: 12.99 };

  describe('Before login', () => {
    describe('POST /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).post("/items").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .post("/items")
          .set('Authorization', 'Bearer BAD')
          .send(item0);
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('GET /', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).get("/items").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .get("/items")
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
    describe('GET /:id', () => {
      it('should send 401 without a token', async () => {
        const res = await request(server).get("/items/123").send(item0);
        expect(res.statusCode).toEqual(401);
      });
      it('should send 401 with a bad token', async () => {
        const res = await request(server)
          .get("/items/456")
          .set('Authorization', 'Bearer BAD')
          .send();
        expect(res.statusCode).toEqual(401);
      });
    });
  });
  describe('after login', () => {
    const user0 = {
      email: 'user0@mail.com',
      password: '123password'
    };
    const user1 = {
      email: 'user1@mail.com',
      password: '456password'
    }
    let token0;
    let adminToken;
    beforeEach(async () => {
      await request(server).post("/login/signup").send(user0);
      const res0 = await request(server).post("/login").send(user0);
      token0 = res0.body.token;
      await request(server).post("/login/signup").send(user1);
      await User.updateOne({ email: user1.email }, { $push: { roles: 'admin'} });
      const res1 = await request(server).post("/login").send(user1);
      adminToken = res1.body.token;
    });
    describe.each([item0, item1])("POST / item %#", (item) => {
      it('should send 403 to normal user and not store item', async () => {
        const res = await request(server)
          .post("/items")
          .set('Authorization', 'Bearer ' + token0)
          .send(item);
        expect(res.statusCode).toEqual(403);
        expect(await Item.count()).toEqual(0);
      });
      it('should send 200 to admin user and store item', async () => {
        const res = await request(server)
          .post("/items")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(item);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(item)
        const savedItem = await Item.findOne({ _id: res.body._id }).lean();
        expect(savedItem).toMatchObject(item);
      });
    });
    describe.each([item0, item1])("PUT / item %#", (item) => {
      let originalItem;
      beforeEach(async () => {
        const res = await request(server)
          .post("/items")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(item);
          originalItem = res.body;
      });
      it('should send 403 to normal user and not update item', async () => {
        const res = await request(server)
          .put("/items/" + originalItem._id)
          .set('Authorization', 'Bearer ' + token0)
          .send({ ...item, price: item.price + 1 });
        expect(res.statusCode).toEqual(403);
        const newItem = await Item.findById(originalItem._id).lean();
        newItem._id = newItem._id.toString();
        expect(newItem).toMatchObject(originalItem);
      });
      it('should send 200 to admin user and update item', async () => {
        const res = await request(server)
          .put("/items/" + originalItem._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send({ ...item, price: item.price + 1 });
        expect(res.statusCode).toEqual(200);
        const newItem = await Item.findById(originalItem._id).lean();
        newItem._id = newItem._id.toString();
        expect(newItem).toMatchObject({ ...originalItem, price: originalItem.price + 1 });
      });
    });
    describe.each([item0, item1])("GET /:id item %#", (item) => {
      let originalItem;
      beforeEach(async () => {
        const res = await request(server)
          .post("/items")
          .set('Authorization', 'Bearer ' + adminToken)
          .send(item);
          originalItem = res.body;
      });
      it('should send 200 to normal user and return item', async () => {
        const res = await request(server)
          .get("/items/" + originalItem._id)
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalItem);
      });
      it('should send 200 to admin user and return item', async () => {
        const res = await request(server)
          .get("/items/" + originalItem._id)
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(originalItem);
      });
    });
    describe("GET / item %#", () => {
      let items;
      beforeEach(async () => {
        items = (await Item.insertMany([item0, item1])).map(i => i.toJSON())
        items.forEach(i => i._id = i._id.toString());
      });
      it('should send 200 to normal user and return all items', async () => {
        const res = await request(server)
          .get("/items/")
          .set('Authorization', 'Bearer ' + token0)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(items);
      });
      it('should send 200 to admin user and return all items', async () => {
        const res = await request(server)
          .get("/items/")
          .set('Authorization', 'Bearer ' + adminToken)
          .send();
        expect(res.statusCode).toEqual(200);
        expect(res.body).toMatchObject(items);
      });
    });
  });
});