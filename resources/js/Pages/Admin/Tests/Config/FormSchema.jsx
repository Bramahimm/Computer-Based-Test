// resources/js/Pages/Admin/Tests/Config/FormSchema.js

export const initialForm = {
  title: "",
  description: "",
  duration: 60,
  start_time: "",
  end_time: "",
  is_active: 1,
  groups: [],
  topics: [],
};

export const transformForEdit = (test) => ({
  title: test.title || "",
  description: test.description || "",
  duration: test.duration || 60,
  start_time: test.start_time?.replace(" ", "T").substring(0, 16) || "",
  end_time: test.end_time?.replace(" ", "T").substring(0, 16) || "",
  is_active: test.is_active,
  groups: test.groups?.map((g) => g.id) || [],
  topics:
    test.topics?.map((t) => ({
      id: t.id, 
      total_questions: t.pivot.total_questions || 10,
      question_type: t.pivot.question_type || 1, 
      random_questions: t.pivot.random_questions || 1,
      random_answers: t.pivot.random_answers || 1,
      max_answers: t.pivot.max_answers || 4,
      answer_mode: t.pivot.answer_mode || 0,
    })) || [],
});
