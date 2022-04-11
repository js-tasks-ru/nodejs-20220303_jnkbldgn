const Validator = require('../Validator');
const expect = require('chai').expect;

describe('testing-configuration-logging/unit-tests', () => {
  describe('Validator', () => {
    let rules = {};
    let value = {};
    let prop = '';

    beforeEach(() => {
      rules = {};
      value = {};
      prop = '';
    });

    after(() => {
      rules = null;
      value = null;
      prop = null;
    });

    it('валидатор должен не возвращать ошибок', () => {
      prop = 'height';
      rules[prop] = {
        type: 'number',
        min: 160,
        max: 200,
      };

      value[prop] = 170;

      const validator = new Validator(rules);
      const errors = validator.validate(value);

      expect(errors).to.have.length(0);
    });

    it('валидатор должен вернуть ошибку типов', () => {
      prop = 'height';
      rules[prop] = {
        type: 'number',
        min: 160,
        max: 200,
      };

      value[prop] = '170';

      const validator = new Validator(rules);
      const errors = validator.validate(value);

      expect(errors).to.have.length(1);
      expect(errors[0]).to.have.property('field').and.to.be.equal(prop);
      expect(errors[0])
          .to.have.property('error')
          .and
          .to.be.equal(`expect ${rules[prop].type}, got ${typeof value[prop]}`);
    });

    describe('валидатор проверяет строковые поля', () => {
      it('валидатор должен вернуть ошибку минимального знечения', () => {
        prop = 'name';
        rules[prop] = {
          type: 'string',
          min: 10,
          max: 20,
        };
        value[prop] = 'John';

        const validator = new Validator(rules);
        const errors = validator.validate(value);

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property('field').and.to.be.equal(prop);
        expect(errors[0])
            .to.have.property('error')
            .and
            .to.be.equal(`too short, expect ${rules[prop].min}, got ${value[prop].length}`);
      });

      it('валидатор должен вернуть ошибку максимального знечения', () => {
        prop = 'name';
        rules[prop] = {
          type: 'string',
          min: 1,
          max: 3,
        };
        value[prop] = 'John';

        const validator = new Validator(rules);
        const errors = validator.validate(value);

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property('field').and.to.be.equal(prop);
        expect(errors[0])
            .to.have.property('error')
            .and
            .to.be.equal(`too long, expect ${rules[prop].max}, got ${value[prop].length}`);
      });
    });

    describe('валидатор проверяет числовые поля', () => {
      it('валидатор должен вернуть ошибку минимального знечения', () => {
        prop = 'age';
        rules[prop] = {
          type: 'number',
          min: 10,
          max: 25,
        };
        value[prop] = 0;

        const validator = new Validator(rules);
        const errors = validator.validate(value);

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property('field').and.to.be.equal(prop);
        expect(errors[0])
            .to.have.property('error')
            .and
            .to.be.equal(`too little, expect ${rules[prop].min}, got ${value[prop]}`);
      });

      it('валидатор должен вернуть ошибку максимального знечения', () => {
        prop = 'age';
        rules[prop] = {
          type: 'number',
          min: 1,
          max: 5,
        };
        value[prop] = 10;

        const validator = new Validator(rules);
        const errors = validator.validate(value);

        expect(errors).to.have.length(1);
        expect(errors[0]).to.have.property('field').and.to.be.equal(prop);
        expect(errors[0])
            .to.have.property('error')
            .and
            .to.be.equal(`too big, expect ${rules[prop].max}, got ${value[prop]}`);
      });
    });

    describe('валидатор проверяет поля нескольких типов', () => {
      it('валидатор должен вернуть ошибки по разным полям', () => {
        rules ={
          age: {
            type: 'number',
            min: 10,
            max: 25,
          },
          name: {
            type: 'string',
            min: 2,
            max: 5,
          },
        };
        value = {
          age: 5,
          name: 'Ibragim',
        };

        const validator = new Validator(rules);
        const errors = validator.validate(value);

        expect(errors).to.have.length(2);
        expect(errors.find(({field}) => field === 'age')).not.undefined;
        expect(errors.find(({field}) => field === 'name')).not.undefined;
      });

      it('валидатор не должен вернуть ошибки', () => {
        rules ={
          age: {
            type: 'number',
            min: 10,
            max: 25,
          },
          name: {
            type: 'string',
            min: 2,
            max: 5,
          },
        };
        value = {
          age: 20,
          name: 'John',
        };

        const validator = new Validator(rules);
        const errors = validator.validate(value);

        expect(errors).to.have.length(0);
      });
    });
  });
});
