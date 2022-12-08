Vue Website Needs:

-   Home page
    -   Create a new room which directs you to a new url (/:roomcode/(admin/teacher/owner))
    -   Join a room which directs you to a new url (/:roomcode/(student/member))
        -   Write in a room code and a name
        -   Should check if the entered exists and then redirect to the new url
    -   Should redirect to correct url if the user has auth
-   /:roomcode/(admin/teacher/owner)
    -   Should verify the room code then check if the user's auth is admin in that room, otherwise redirect to homepage
    -   When entered, should fetch the room info from the server and setup ws
-   /:roomcode/(student/member)
    -   Should verify the room code then check if the user's auth is a member in that room, otherwise redirect to homepage
    -   When entered, should fetch the name and member info from the server and setup ws
