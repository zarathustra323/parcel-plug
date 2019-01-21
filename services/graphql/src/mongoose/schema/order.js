const { Schema } = require('mongoose');
const connection = require('../connections/account');
const {
  deleteablePlugin,
  paginablePlugin,
  referencePlugin,
  repositoryPlugin,
  userAttributionPlugin,
} = require('../plugins');

const schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  advertiserName: {
    type: String,
    required: true,
    trim: true,
  },
}, { timestamps: true });

schema.plugin(referencePlugin, {
  name: 'advertiserId',
  connection,
  modelName: 'advertiser',
  options: { required: true },
});
schema.plugin(deleteablePlugin);
schema.plugin(repositoryPlugin);
schema.plugin(paginablePlugin, {
  collateWhen: ['name', 'advertiserName'],
});
schema.plugin(userAttributionPlugin);

schema.pre('validate', async function setAdvertiserName() {
  if (this.isModified('advertiserId') || !this.advertiserName) {
    const advertiser = await connection.model('advertiser').findOne({ _id: this.advertiserId }, { name: 1 });
    this.advertiserName = advertiser.name;
  }
});

schema.pre('validate', function setFullName() {
  const { name, advertiserName } = this;
  this.fullName = `${advertiserName} > ${name}`;
});

schema.pre('save', async function updateRelatedModels() {
  if (this.isModified('advertiserId') || this.isModified('name')) {
    const [lineitems, ads] = await Promise.all([
      connection.model('lineitem').find({ orderId: this.id }),
      connection.model('ad').find({ orderId: this.id }),
    ]);

    lineitems.forEach((lineitem) => {
      lineitem.set('advertiserId', this.advertiserId);
      lineitem.set('advertiserName', this.advertiserName);
      lineitem.set('orderName', this.name);
      lineitem.save();
    });

    ads.forEach((ad) => {
      ad.set('advertiserId', this.advertiserId);
      ad.set('advertiserName', this.advertiserName);
      ad.set('orderName', this.name);
      ad.save();
    });
  }
});

schema.index({ name: 1, _id: 1 }, { collation: { locale: 'en_US' } });
schema.index({ advertiserName: 1, _id: 1 }, { collation: { locale: 'en_US' } });
schema.index({ updatedAt: 1, _id: 1 });
schema.index({ createdAt: 1, _id: 1 });

module.exports = schema;
