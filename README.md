## WPI Magic: the Gathering Club Website

NOTE: Importing my project to Glitch from GitHub results in an endless loading screen, so I had to manually copy-and-paste all of my code into Glitch. This, unfortunately, resulted in Glitch being unable to load the module 'lowdb', which is rather vital to the project. If clicking the link below results in errors of some kind, please download my repo, cd into it from the terminal, run "node server.improved.js", and navigate to "localhost:3000" from your web browser. Apologies for any inconvenience.

http://a3-eliehess.glitch.me

Use admin/admin for username and password

I designed my website to make it easier for members and officers of the WPI Magic: the Gathering club to add themselves to a hypothetical club website that could be used to register users for events and the like. I was unfortunately prevented from implementing everything I wanted from this website by a couple of difficult-to-locate bugs. One of them (which prevented me from progressing for most of Wednesday the 18th) stumped both Tariq and Cormac, and took Professor Roberts half an hour to solve. Please be lenient when grading my assignment :)

Features I want to add:
- prevent users from viewing others' passwords or modifying their data
- "main page" with a calendar that can be modified

- I used lowdb to store website data in a persistent database, mostly because it was the recommended database for this project, but also because it's simple and easy to use.
- I used the Tachyon CSS framework as it's lightweight yet easily-readable, and modified it to both make my website a little more colorful and make it occupy most of the screen.
- Express middleware I used:
  - morgan
  - compression
  - body-parser
  - helmet
  - response-time

## Technical Achievements
- **Tech Achievement 1**: Examine response status code to determine whether or not login was valid.
- **Tech Achievement 2**: Examine list of usernames to determine whether or not a new user's username request can be met.

### Design/Evaluation Achievements
- **Design Achievement 1**: Tested application with 6 members of the WPI Magic: the Gathering club and took feature suggestions, though I was not able to implement all of them.
