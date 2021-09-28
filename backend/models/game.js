const gameSchema = new Schema({
	players: [
    {
      type: mongoose.Types.ObjectId,
      required: false,
      ref: 'Player'
    }
  ],
  round1: [
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
  round2: {
		index: {
			type: Number,
			required: true
		},
		suit: {
			type: String,
			required: true
		},
		value: {
			type: Number,
			required: true
		}
	},
  round3: {
		index: {
			type: Number,
			required: true
		},
		suit: {
			type: String,
			required: true
		},
		value: {
			type: Number,
			required: true
		}
	},
  date: {
    type: String,
    required: true
  },
  code: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true
  },
	host: {
		type: mongoose.Types.ObjectId,
		required: true,
		ref: 'User'
	},
	cardsQuantity: {
		type: Number,
		required: true
	},
	communityCards: [
		{
			type: Number,
			required: true
		}
	],
	turn: {
		type: Number,
		required: true
	},
	round: {
		type: Number,
		required: true
	}
});

module.exports = mongoose.model('Game', userSchema);
