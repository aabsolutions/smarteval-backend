const mongoose = require('mongoose');
const { Types } = mongoose;

async function test() {
  await mongoose.connect('mongodb://localhost:27017/smart');
  console.log('Connected');

  const questionSchema = new mongoose.Schema({
    topicId: { type: Types.ObjectId, ref: 'Topic' }
  });
  const Question = mongoose.model('Question', questionSchema);

  const qs = await Question.find().limit(1);
  if (qs.length === 0) {
    console.log('No questions');
    process.exit(0);
  }
  
  const topicId = qs[0].topicId;
  const countAll = await Question.countDocuments({ topicId });
  console.log('Total questions in topic:', countAll);

  // Test with string size instead of number
  let size = "2"; 
  try {
    const randomQuestions = await Question.aggregate([
      { $match: { topicId: topicId } },
      { $sample: { size: size } }
    ]);
    console.log('Sampled size with string size:', randomQuestions.length);
  } catch (e) {
    console.error('Error with string size:', e.message);
  }
  
  process.exit(0);
}
test().catch(console.error);
