***TO DO***
For the next steps to work on for this project, two main issues can be addressed:
1. ORGANIZING THE DATABASE: Currently we are using Firebase to store all the data associated with the music exercises on the application. In hopes of creating a more clear sturcture that is  easier to navigate and understand, a potential next step would be to add in an index number that can be associated with each individual exercise. This index number will determine the exercise's order within the actual database strucutre itself, allowing the programmer to have more control of the organization of the data storage. These indexes would only be visible in the exercise management page for Admin users, so that regular users would not have access to edit the order of the exercises.
2. DELETE EXERCISE BUG: Currently when an admin user deletes an exercise, they are booted from the management page as if they were an un-authenticated user. For the next implementation of the project, cleaning up this bug would be a good early step just to make sure the process of deleting a task and continuing to other work on the application is more streamlined.
3. Further extensions for the project can be decided on by Prof. Duker, the client and propser of the project. Some potential extensions may include
    - Style and design changes to the site
    - Implementation of new kinds of music errors
    - More detailed documentation through the code (comments, only necessary if sections still unclear)
    - Sturcture updates to the Firebase database
    - Additional Admin privileges (different kinds of updates to exercises and exercises management)