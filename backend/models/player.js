const mongoose = require('mongoose');
const Schema = mongoose.Schema;
// const player = {
//   user: "",
//   game: "",
//   turn: "",
//   status: "waiting, ready, fold, loser, winner",
//   bet: 0,
//   givenCards: [],
//   finalCards: []
// }
const playerSchema = new Schema({
	user: {
		type: mongoose.Types.ObjectId,
		required: true,
    ref: 'User'
	},
	name: {
		type: String,
		required: true
	},
	turn: {
		type: Number,
		required: true
	},
  status: {
    type: String,
    required: true
  },
  bet: {
    type: Number,
    required: true
  },
  givenCards: [
    {
			index: {
				type: Number,
				required: true
			},
			suit: {
				type: String,
				required: true
			},
			value: {
				type: String,
				required: true
			}
    }
  ],
  finalCards: [
    {
			index: {
				type: Number,
				required: true
			},
			suit: {
				type: String,
				required: true
			},
			value: {
				type: String,
				required: true
			}
    }
  ]
});

module.exports = mongoose.model('Player', playerSchema);
