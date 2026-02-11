# Error Detection Practice Website

## Overview

This website helps music students improve their **listening skills** by practicing how to hear mistakes in music. Users go through exercises where they listen to a recording and follow along with a music score. They try to find the wrong notes and get feedback to help them learn and improve.

## Features

- Upload and interact with music-based exercises
- Visual and audio components for each exercise
- Click-to-select error identification and feedback
- Admin interface for uploading and managing exercises

## Technologies Used

- **ABCjs**: For rendering music notation interactively in the browser.
- **Firebase**: Handles real-time data storage, user authentication, and content management.
- **AWS Amplify**: Hosts the frontend and connects with backend infrastructure.

## How Exercises Work

Each exercise contains a music score and an associated audio file. The score is assumed to contain the correct notes. Users can:

1. Play the audio and visually follow along with the score.
2. Spot potential errors in the music—typically incorrect notes caused by pitch or intonation issues.
3. Click on a note they believe is incorrect and select the type of error they think it represents.
4. Submit their answer using the **Check Answers** button.
5. Receive **written and visual feedback** on their selections to help improve their accuracy.

This process allows users to practice and refine their listening skills through guided feedback.

## Admin Access Instructions

To manage or upload new exercises:

1. **Navigate to the Help Tab**  
   Open the main dashboard and select the `Help` tab in the top navigation menu.

2. **Log In as Admin**  
   A login form will be displayed. Use the admin credentials to sign in.

3. **Credentials**  
   Admin emails and passwords are stored securely in Firebase. Contact Professor Duker for access.

> :warning: **Note**: Admin access allows modification and upload of new exercises **directly through the website**—no Firebase console interaction is required.

## Deployment & Backend Access

- **Firebase Console**: [https://console.firebase.google.com/](https://console.firebase.google.com/)
- **AWS Console**: [https://aws.amazon.com/console/](https://aws.amazon.com/console/)

## TO-DO List

For the next steps to work on for this project, two main issues can be addressed:

1. ORGANIZING THE DATABASE: Currently we are using Firebase to store all the data associated with the music exercises on the application. In hopes of creating a more clear structure that is easier to navigate and understand, a potential next step would be to add in an index number that can be associated with each individual exercise. This index number will determine the exercise's order within the actual database strucutre itself, allowing the programmer to have more control of the organization of the data storage. These indexes would only be visible in the exercise management page for Admin users, so that regular users would not have access to edit the order of the exercises.
2. DELETE EXERCISE BUG: Currently when an admin user deletes an exercise, they are booted from the management page as if they were an un-authenticated user. For the next implementation of the project, cleaning up this bug would be a good early step just to make sure the process of deleting a task and continuing to other work on the application is more streamlined.
3. Further extensions for the project can be decided on by Prof. Duker, the client and propser of the project. Some potential extensions may include
   - Style and design changes to the site
   - Implementation of new kinds of music errors
   - More detailed documentation through the code (comments, only necessary if sections still unclear)
   - Sturcture updates to the Firebase database
   - Additional Admin privileges (different kinds of updates to exercises and exercises management)

## Contact

For admin credentials or technical access, please contact:  
**Professor Duker** –

---

## Notes

- This documentation is for internal use. Do **not** publish admin credentials or sensitive links.
- If contributing, please use a separate branch and submit changes via pull request for review.
