# app.py

import openai
import os
from dotenv import load_dotenv
load_dotenv()
import time 
import sys
import json

# print("Starting app.py")

# Set your OpenAI API key
openai.api_key = os.getenv("OPENAI_API_KEY")

uncertainty_words = ["don't know", "not sure", "no idea","uncertain", "confused", "blank", "lost"]

def verify_answer(question, user_answer):
    print("Verifying answer...")
    time.sleep(20)
    prompt = f"{question}\nUser answer: {user_answer}\nIs the answer correct? (yes or no)(make it yes if it is approximately correct(For example if the user is unable to provide the exact number.)) \n"
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=10
    )

    feedback = response.choices[0].text.strip().lower()
    
    if feedback == "yes":
        prompt2 = f"Question: {question}\nUser answer: {user_answer}\n Speak about it (within 100 words)"
        response2 = openai.Completion.create(
            engine="text-davinci-003",
            prompt=prompt2,
            max_tokens=200
        )
        feedback2 = response2.choices[0].text.strip().lower()
        
        feedback_data = {
            "is_correct": True,
            "feedback": "Correct answer! Well done!",
            "follow_up_question": feedback2
        }  
        #print(feedback_data)      

    elif feedback== "no":
        feedback_data = {
            "is_correct": False,
            "feedback": "It seems your answer needs clarification. Could you elaborate?"
        }
        user_answer1 = input(f"Interviewer: It seems your answer needs clarification. Could you elaborate?\nYour Answer: ")
        verify_answer(question, user_answer1)
  
    elif any(keyword in user_answer.lower() for keyword in uncertainty_words):
        feedback_data = {
            "is_correct": False,
            "feedback": "That's okay! Mistakes happen. Remember, every attempt is a step towards learning."
        }
  
        print("That's okay! Mistakes happen. Remember, every attempt is a step towards learning.")
        return feedback_data  # Return the result to exit the function
    
    else:
        feedback_data = {
            "is_correct": False,
            "feedback": "Sorry. Can you repeat?"
        }
   
        user_answer2 = input(f"Interviewer: Sorry. Can you repeat?\nYour Answer: ")
        return verify_answer(question, user_answer2)

    time.sleep(20)
    pretty_feedback = json.dumps(feedback_data, indent=4)
    print(pretty_feedback)
    return feedback_data['is_correct']


def generate_followup_question(previous_question, user_answer):
    print("\nGenerating follow-up question...")
    prompt = f"Based on your previous response:\n\nQ: {previous_question}\nA: {user_answer}\n\nGenerate a follow-up question:"
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=prompt,
        max_tokens=150
    )

    generated_text = response.choices[0].text.strip()
    followup_data = {
        "follow_up_question": generated_text
    }
    # print("Response: ",response)
    # print("generated text: ",generated_text)
    time.sleep(20)  # Add a delay of 20 seconds
    # print("Follow-up data:", followup_data)
    
    return generated_text


# print("Finished app.py")
# Main function
def main():
    # Ask the main question
    main_question = "What is the capital of France?"
    user_answer = input(f"Main Question: {main_question}\nYour Answer: ")
    is_correct = verify_answer(main_question, user_answer)
    try:
        while is_correct==True:
            # Generate follow-up question
            followup_question = generate_followup_question(main_question, user_answer)
            user_answer1 = input(f"Follow-up Question: {followup_question}\nYour Answer: ")
            verify_answer(followup_question, user_answer1)
            main_question = followup_question
    except KeyboardInterrupt:
        print("\nScript interrupted. Exiting gracefully.")

    # try:
    #     if len(sys.argv) >= 2:
    #         current_question = sys.argv[1]
    #         user_answer = sys.argv[2]
            
    #         is_correct = verify_answer(current_question, user_answer)
    #         time.sleep(20)
    #         try:
    #             while is_correct:
    #                 # Generate follow-up question
    #                 followup_question = generate_followup_question(current_question, user_answer)
    #                 user_answer1 = sys.argv[2]
    #                 verify_answer(followup_question, user_answer1)
    #                 current_question = followup_question
    #         except KeyboardInterrupt:
    #             print("\nScript interrupted. Exiting gracefully.")


    # except Exception as e:
    #     print("Error:", str(e))

if __name__ == "__main__":
    main()