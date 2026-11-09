*** Settings ***
Documentation     Front-end browser tests for EVENT/OS. Uses both CSS and XPath selectors.
Library           SeleniumLibrary
Suite Setup       Open Demo Browser
Suite Teardown    Close All Browsers

*** Variables ***
${BASE_URL}        http://localhost:5500/
${USERNAME}        admin
${PASSWORD}        Event@2026
${BROWSER}         chrome

*** Keywords ***
Open Demo Browser
    Open Browser    ${BASE_URL}    ${BROWSER}
    Maximize Browser Window
    Execute Javascript    window.localStorage.removeItem('eventos_records_v2'); window.localStorage.removeItem('eventos_demo_accounts_v4'); window.sessionStorage.clear();
    Reload Page
    Wait Until Element Is Visible    css:#login-form

Enter Credentials
    [Arguments]    ${username}    ${password}
    Input Text    css:#login-username    ${username}
    Input Password    xpath=//input[@id='login-password']    ${password}
    Click Button    css:#login-submit

Open Section
    [Arguments]    ${section}
    Click Element    css:[data-testid="nav-${section}"]
    Wait Until Element Is Visible    css:#records-table

Open Event Row Action
    [Arguments]    ${event}    ${action}
    Click Element    xpath=//tr[.//strong[normalize-space()='${event}']]//button[@data-action='${action}']

Save And Check Toast
    Click Button    css:#save-record
    Wait Until Element Is Visible    css:[data-testid="toast"]

*** Test Cases ***
01 Empty Login Shows Validation
    Click Button    css:#login-submit
    Element Text Should Be    css:#login-username-error    Enter your username.
    Element Text Should Be    css:#login-password-error    Enter your password.
    Capture Page Screenshot    01-empty-login.png

02 Incorrect Username Is Rejected
    Enter Credentials    wrong-user    ${PASSWORD}
    Element Text Should Be    css:#login-error    Incorrect username or password.
    Page Should Contain Element    css:#login-form
    Capture Page Screenshot    02-invalid-username.png

03 Incorrect Password Is Rejected
    Enter Credentials    ${USERNAME}    wrong-pass
    Element Text Should Be    css:#login-error    Incorrect username or password.
    Page Should Contain Element    css:#login-form
    Capture Page Screenshot    03-invalid-password.png

04 Incorrect Username And Password Are Rejected
    Enter Credentials    wrong-user    wrong-pass
    Element Text Should Be    css:#login-error    Incorrect username or password.
    Page Should Contain Element    css:#login-form
    Capture Page Screenshot    04-both-invalid.png

05 Password Visibility Button Works
    Click Button    css:#toggle-password
    ${type}=    Get Element Attribute    css:#login-password    type
    Should Be Equal    ${type}    text
    Click Button    css:#toggle-password
    ${type}=    Get Element Attribute    css:#login-password    type
    Should Be Equal    ${type}    password
    Capture Page Screenshot    05-password-toggle.png

05A Sign Up Page Opens With Three Fields
    Click Element    css:#signup-link
    Wait Until Element Is Visible    css:#signup-form
    Page Should Contain Element    css:#signup-username
    Page Should Contain Element    css:#signup-password
    Page Should Contain Element    xpath=//input[@id='signup-confirm']
    Capture Page Screenshot    05a-signup.png

05B Empty Sign Up Shows Validation
    Click Button    css:#signup-submit
    Element Text Should Be    css:#signup-form [data-error-for="username"]    Enter a username.
    Element Text Should Be    css:#signup-form [data-error-for="password"]    Enter a password.
    Element Text Should Be    css:#signup-form [data-error-for="confirm"]    Confirm your password.
    Capture Page Screenshot    05b-empty-signup.png

05C Sign Up Rejects Duplicate Username
    Input Text    css:#signup-username    admin
    Input Password    css:#signup-password    ValidPass@2026
    Input Password    css:#signup-confirm    ValidPass@2026
    Click Button    css:#signup-submit
    Element Text Should Be    css:#signup-form [data-error-for="username"]    Username is already taken.
    Capture Page Screenshot    05c-duplicate-username.png

05D Sign Up Validates Username Format
    Input Text    css:#signup-username    ab
    Click Button    css:#signup-submit
    Element Should Contain    css:#signup-form [data-error-for="username"]    3–20
    Capture Page Screenshot    05d-username-format.png

05E Sign Up Rejects Short Password
    Input Text    css:#signup-username    signup_member
    Input Password    css:#signup-password    short
    Input Password    css:#signup-confirm    short
    Click Button    css:#signup-submit
    Element Should Contain    css:#signup-form [data-error-for="password"]    at least 8
    Capture Page Screenshot    05e-short-password.png

05F Sign Up Rejects Password Mismatch
    Input Password    css:#signup-password    ValidPass@2026
    Input Password    css:#signup-confirm    DifferentPass@2026
    Click Button    css:#signup-submit
    Element Text Should Be    css:#signup-form [data-error-for="confirm"]    Passwords do not match.
    Capture Page Screenshot    05f-password-mismatch.png

05G Sign Up Password Icons Work Independently
    Click Button    css:#toggle-signup-password
    ${one}=    Get Element Attribute    css:#signup-password    type
    ${two}=    Get Element Attribute    xpath=//input[@id='signup-confirm']    type
    Should Be Equal    ${one}    text
    Should Be Equal    ${two}    password
    Click Button    css:#toggle-signup-confirm
    ${two}=    Get Element Attribute    css:#signup-confirm    type
    Should Be Equal    ${two}    text
    Capture Page Screenshot    05g-password-icons.png

05H New User Can Sign Up And Log In
    Input Password    css:#signup-password    ValidPass@2026
    Input Password    css:#signup-confirm    ValidPass@2026
    Click Button    css:#signup-submit
    Wait Until Element Is Visible    css:#login-form
    Element Should Contain    css:#toast-root    Account created.
    Capture Page Screenshot    05h-created.png
    Enter Credentials    signup_member    ValidPass@2026
    Wait Until Element Is Visible    css:.visitor-header
    Element Should Contain    css:.visitor-account    signup_member
    Page Should Not Contain Element    css:.sidebar
    Capture Page Screenshot    05h-new-user-login.png
    Click Button    css:#logout-button
    Click Button    css:#confirm-logout
    Wait Until Element Is Visible    css:#login-form

05I New User Account Persists And Tickets Are Separate
    Reload Page
    Wait Until Element Is Visible    css:#login-form
    Enter Credentials    signup_member    ValidPass@2026
    Click Element    css:[data-testid="nav-events"]
    Click Button    css:[data-testid="register-e1"]
    Click Button    css:#confirm-register
    Click Element    css:[data-testid="nav-my-registrations"]
    Page Should Contain    Design & Culture Forum
    Capture Page Screenshot    05i-new-user-ticket.png
    Click Button    css:#logout-button
    Click Button    css:#confirm-logout
    Enter Credentials    user    User@2026
    Click Element    css:[data-testid="nav-my-registrations"]
    Page Should Not Contain    Design & Culture Forum
    Capture Page Screenshot    05i-ticket-isolation.png
    Click Button    css:#logout-button
    Click Button    css:#confirm-logout
    Wait Until Element Is Visible    css:#login-form

06 Valid Login Opens Dashboard
    Enter Credentials    ${USERNAME}    ${PASSWORD}
    Wait Until Element Is Visible    css:#main-content
    Page Should Contain Element    css:.metric-grid
    Location Should Contain    #dashboard
    Capture Page Screenshot    06-login-dashboard.png

07 Dashboard New Event Button Opens Form
    Click Button    xpath=//button[@data-action='add' and @data-type='events']
    Wait Until Element Is Visible    css:#record-form
    Element Should Be Visible    css:#field-title
    Capture Page Screenshot    07-dashboard-new-event.png
    Click Button    xpath=//button[@data-action='close-overlay' and not(contains(@class,'overlay-backdrop'))]

08 Navigation Opens Every Module
    Open Section    events
    Page Should Contain    All events
    Open Section    participants
    Page Should Contain    All participants
    Open Section    registrations
    Page Should Contain    All registrations
    Open Section    schedules
    Page Should Contain    All schedules
    Capture Page Screenshot    08-navigation.png

09 View Existing Events
    Open Section    events
    Page Should Contain    Design & Culture Forum
    ${count}=    Get Element Count    css:tr.record-row
    Should Be True    ${count} >= 4
    Capture Page Screenshot    09-view-events.png

10 Select Event Row
    Click Element    xpath=//tr[.//strong[normalize-space()='Design & Culture Forum']]
    ${selected}=    Get Element Attribute    xpath=//tr[.//strong[normalize-space()='Design & Culture Forum']]    aria-selected
    Should Be Equal    ${selected}    true
    Capture Page Screenshot    10-select-event.png

11 View Event Details
    Open Event Row Action    Design & Culture Forum    view
    Element Text Should Be    css:#details-title    Design & Culture Forum
    Page Should Contain    Capacity
    Capture Page Screenshot    11-view-event-details.png
    Click Button    css:.drawer-top [data-action="close-overlay"]

12 Event Form Requires Valid Fields
    Click Button    css:#add-events
    Click Button    css:#save-record
    Element Text Should Be    css:[data-error-for="title"]    Event name is required.
    Element Text Should Be    css:[data-error-for="venue"]    Venue is required.
    Capture Page Screenshot    12-event-validation.png
    Click Button    css:.modal-head [data-action="close-overlay"]

13 Add Event
    Click Button    css:#add-events
    Input Text    css:#field-title    Automated Sample Event
    Input Text    css:#field-venue    Test Auditorium
    Save And Check Toast
    Page Should Contain    Automated Sample Event
    Capture Page Screenshot    13-add-event.png

14 Edit Event
    Open Event Row Action    Automated Sample Event    edit
    Input Text    css:#field-title    Updated Automated Event
    Save And Check Toast
    Page Should Contain    Updated Automated Event
    Capture Page Screenshot    14-edit-event.png

15 Search Events
    Input Text    css:#record-search    Updated Automated Event
    ${count}=    Get Element Count    css:tr.record-row
    Should Be Equal As Integers    ${count}    1
    Capture Page Screenshot    15-search-event.png
    Clear Element Text    css:#record-search

16 Filter Event Status
    Select From List By Label    css:#record-filter    Planned
    ${count}=    Get Element Count    css:tr.record-row
    Should Be True    ${count} >= 1
    Capture Page Screenshot    16-event-filter.png
    Select From List By Label    css:#record-filter    All status

17 Delete Event
    Open Event Row Action    Updated Automated Event    delete
    Wait Until Element Is Visible    css:#confirm-delete
    Capture Page Screenshot    17-delete-confirmation.png
    Click Button    css:#confirm-delete
    Page Should Not Contain    Updated Automated Event
    Capture Page Screenshot    17-deleted-event.png

18 Add Participant And Validate Email
    Open Section    participants
    Click Button    css:#add-participants
    Input Text    css:#field-fullName    Test Participant
    Input Text    css:#field-email    not-an-email
    Click Button    css:#save-record
    Element Text Should Be    css:[data-error-for="email"]    Enter a valid email address.
    Capture Page Screenshot    18-email-validation.png
    Input Text    css:#field-email    test.person@example.com
    Save And Check Toast
    Page Should Contain    Test Participant
    Capture Page Screenshot    18-add-participant.png

19 Edit Participant
    Click Element    xpath=//tr[.//strong[normalize-space()='Test Participant']]//button[@data-action='edit']
    Input Text    css:#field-organization    Testing Team
    Save And Check Toast
    Page Should Contain    Testing Team
    Capture Page Screenshot    19-edit-participant.png

20 Add Registration
    Open Section    registrations
    Click Button    css:#add-registrations
    Select From List By Label    css:#field-participantId    Test Participant
    Save And Check Toast
    Page Should Contain    Test Participant
    Capture Page Screenshot    20-add-registration.png

21 Duplicate Registration Is Rejected
    Click Button    css:#add-registrations
    Select From List By Label    css:#field-participantId    Test Participant
    Click Button    css:#save-record
    Element Should Contain    css:#form-error    already registered
    Capture Page Screenshot    21-duplicate-registration.png
    Click Button    css:.modal-head [data-action="close-overlay"]

22 Registration Status Can Be Edited
    Click Element    xpath=//tr[.//strong[normalize-space()='Test Participant']]//button[@data-action='edit']
    Select From List By Label    css:#field-status    Waitlisted
    Save And Check Toast
    Page Should Contain    Waitlisted
    Capture Page Screenshot    22-edit-registration.png

23 Delete Registration
    Click Element    xpath=//tr[.//strong[normalize-space()='Test Participant']]//button[@data-action='delete']
    Click Button    css:#confirm-delete
    Page Should Not Contain    Test Participant
    Capture Page Screenshot    23-delete-registration.png

24 Add Schedule Entry
    Open Section    schedules
    Click Button    css:#add-schedules
    Input Text    css:#field-title    Test Opening Session
    Input Text    css:#field-location    Main Stage
    Save And Check Toast
    Page Should Contain    Test Opening Session
    Capture Page Screenshot    24-add-schedule.png

25 View And Edit Schedule Entry
    Click Element    xpath=//tr[.//strong[normalize-space()='Test Opening Session']]//button[@data-action='view']
    Element Text Should Be    css:#details-title    Test Opening Session
    Capture Page Screenshot    25-view-schedule.png
    Click Button    css:.drawer-footer [data-action="edit"]
    Input Text    css:#field-title    Updated Opening Session
    Save And Check Toast
    Page Should Contain    Updated Opening Session
    Capture Page Screenshot    25-edit-schedule.png

26 Delete Schedule Entry
    Click Element    xpath=//tr[.//strong[normalize-space()='Updated Opening Session']]//button[@data-action='delete']
    Click Button    css:#confirm-delete
    Page Should Not Contain    Updated Opening Session
    Capture Page Screenshot    26-delete-schedule.png

27 Delete Participant
    Open Section    participants
    Click Element    xpath=//tr[.//strong[normalize-space()='Test Participant']]//button[@data-action='delete']
    Click Button    css:#confirm-delete
    Page Should Not Contain    Test Participant
    Capture Page Screenshot    27-delete-participant.png

28 Logout And Block Protected Page
    Click Button    css:#logout-button
    Wait Until Element Is Visible    css:#logout-title
    Click Button    css:#confirm-logout
    Wait Until Element Is Visible    css:#login-form
    Capture Page Screenshot    28-logout.png
    Go To    ${BASE_URL}#events
    Wait Until Element Is Visible    css:#login-form
    Page Should Not Contain Element    css:#records-table
    Capture Page Screenshot    28-protected-page.png


29 User Login And Restricted Navigation
    Enter Credentials    user    User@2026
    Wait Until Element Is Visible    css:#main-content
    Page Should Contain    FIND YOUR
    Page Should Contain Element    css:[data-testid="nav-my-registrations"]
    Page Should Not Contain Element    css:[data-testid="nav-participants"]
    Capture Page Screenshot    29-user-dashboard.png

30 User Can Browse Events
    Click Element    css:[data-testid="nav-events"]
    Wait Until Element Is Visible    css:.visitor-event-grid--catalog
    Page Should Contain    Design & Culture Forum
    Capture Page Screenshot    30-user-events.png

31 User Event Search
    Input Text    css:#record-search    Campus Creatives
    ${count}=    Get Element Count    css:.user-event-card
    Should Be Equal As Integers    ${count}    1
    Capture Page Screenshot    31-user-search.png
    Clear Element Text    css:#record-search

32 User Views Event In Modal
    Click Button    xpath=//article[@data-testid='user-event-e1']//button[@data-action='user-view']
    Wait Until Element Is Visible    css:#user-event-title
    Page Should Contain    The Commons Hall
    Capture Page Screenshot    32-user-view.png
    Click Button    css:.visitor-detail-close

33 User Registers For Event
    Click Button    css:[data-testid="register-e1"]
    Wait Until Element Is Visible    css:#register-title
    Capture Page Screenshot    33-register-confirmation.png
    Click Button    css:#confirm-register
    Wait Until Element Is Visible    css:[data-testid="toast"]
    Click Element    css:[data-testid="nav-my-registrations"]
    Page Should Contain    Design & Culture Forum
    Capture Page Screenshot    33-user-registered.png

34 User Cancels Registration
    Click Button    css:[data-action="user-cancel"]
    Wait Until Element Is Visible    css:#cancel-title
    Capture Page Screenshot    34-cancel-confirmation.png
    Click Button    css:#confirm-cancel-registration
    Page Should Contain Element    css:.registration-card .badge--cancelled
    Capture Page Screenshot    34-registration-cancelled.png

35 User Can Register Again
    Click Element    css:[data-testid="nav-events"]
    Click Button    css:[data-testid="register-e1"]
    Click Button    css:#confirm-register
    Page Should Contain Element    css:.visitor-card-status .badge--confirmed
    Capture Page Screenshot    35-reregister.png

36 User Checks Schedules
    Click Element    css:[data-testid="nav-schedules"]
    Wait Until Element Is Visible    css:.schedule-card
    Page Should Contain    Opening session
    Capture Page Screenshot    36-user-schedules.png

37 User Cannot Access Admin Pages Via URL
    Go To    ${BASE_URL}#participants
    Page Should Not Contain Element    css:[data-testid="nav-participants"]
    Page Should Contain    FIND YOUR
    Capture Page Screenshot    37-restricted-admin-route.png

38 User Logout Confirmation
    Click Button    css:#logout-button
    Wait Until Element Is Visible    css:#logout-title
    Click Button    css:.modal-footer [data-action="close-overlay"]
    Page Should Contain Element    css:#main-content
    Click Button    css:#logout-button
    Click Button    css:#confirm-logout
    Wait Until Element Is Visible    css:#login-form
    Capture Page Screenshot    38-user-logout.png

39 Mobile Navigation And No Horizontal Overflow
    Enter Credentials    user    User@2026
    Set Window Size    375    812
    Wait Until Element Is Visible    css:.visitor-menu
    ${overflow}=    Execute Javascript    return document.documentElement.scrollWidth > window.innerWidth;
    Should Be Equal    ${overflow}    ${False}
    Click Button    css:.visitor-menu
    Wait Until Element Is Visible    css:.visitor-navigation--open
    Click Element    css:.visitor-navigation--open [data-testid="nav-schedules"]
    Page Should Contain    Opening session
    Capture Page Screenshot    39-mobile-navigation.png
    Set Window Size    1440    900

40 User Can Filter Event Categories
    Click Element    css:[data-testid="nav-events"]
    Select From List By Value    css:#visitor-category    Workshop
    ${count}=    Get Element Count    css:.visitor-event-card
    Should Be Equal As Integers    ${count}    1
    Page Should Contain    Campus Creatives Workshop
    Capture Page Screenshot    40-user-filter.png
    Select From List By Value    css:#visitor-category    All
    ${count}=    Get Element Count    css:.visitor-event-card
    Should Be Equal As Integers    ${count}    4

41 User Home CTA Navigates To Events
    Click Element    css:[data-testid="nav-dashboard"]
    Wait Until Element Is Visible    css:.visitor-hero
    Click Element    css:.visitor-hero-actions [data-nav="events"]
    Wait Until Element Is Visible    css:.visitor-event-grid--catalog
    Capture Page Screenshot    41-user-hero-navigation.png
