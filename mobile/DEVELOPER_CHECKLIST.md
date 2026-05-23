# ✅ Haritaly Mobile App - Developer Checklist

Use this checklist to track your progress as you develop the Haritaly mobile app.

---

## 🎯 Phase 1: Setup & Verification (Current)

### Installation
- [ ] Clone or navigate to the project folder
- [ ] Run `npm install` successfully
- [ ] Create `.env` file from `.env.example`
- [ ] Update API URL in `.env`
- [ ] Verify all dependencies installed (`npm list`)

### First Run
- [ ] Run `npm start`
- [ ] App starts without crashing
- [ ] Splash screen appears
- [ ] Either see login screen OR see map (if token exists)
- [ ] No console errors or warnings

### File Verification
- [ ] Verify 16 main files exist
- [ ] Verify 8 documentation files exist
- [ ] Check `app/(app)/map.tsx` has map code
- [ ] Check `src/store/auth.ts` has auth context
- [ ] Check `src/api/client.ts` has API client

### Documentation Review
- [ ] Read INDEX.md
- [ ] Read QUICK_START.md
- [ ] Read README.md
- [ ] Understand project structure
- [ ] Know where main files are located

---

## 🗺️ Phase 2: Map Screen Testing

### Map Display
- [ ] Open app
- [ ] Navigate to map screen
- [ ] Map renders without errors
- [ ] Map displays correctly
- [ ] Can zoom in/out
- [ ] Can pan/drag

### Location Services
- [ ] App asks for location permission
- [ ] Permission is granted (or handle denied)
- [ ] Blue dot appears on map (user location)
- [ ] Dot updates when you move (if on real device)

### Place Pins
- [ ] Test data shows pins on map
- [ ] Pins display with correct colors
- [ ] Blue pins = user's places
- [ ] Pink pins = friends' places
- [ ] Pins have labels with place names
- [ ] Pins show ratings when available

### Map Controls
- [ ] "All" filter button works
- [ ] "Friends" filter button works
- [ ] Toggling shows/hides correct pins
- [ ] Info bar shows correct count
- [ ] Legend displays correctly
- [ ] Location button centers map on user

### Interactions
- [ ] Can tap a pin
- [ ] Pin tap triggers navigation
- [ ] Can open FAB menu
- [ ] FAB button styled correctly
- [ ] No crashes when interacting

### Map-Related Data
- [ ] Location updates every 10 seconds
- [ ] Nearby places fetch correctly
- [ ] User's places load on mount
- [ ] No API errors in console
- [ ] Loading states show appropriately

---

## 👥 Phase 3: Friends Screen Testing

### Friend List Display
- [ ] Navigate to Friends tab
- [ ] Friends screen renders
- [ ] Can see friend list (if any exist)
- [ ] Each friend shows avatar and name
- [ ] Email is displayed
- [ ] List is scrollable

### Friend Requests
- [ ] Pending requests section appears (if requests exist)
- [ ] Request cards display correctly
- [ ] Accept button works
- [ ] Reject button works
- [ ] Buttons styled correctly
- [ ] Accept/reject triggers state update

### Empty States
- [ ] Empty state message shows (if no friends)
- [ ] "Add Friend" button is visible
- [ ] Button is clickable
- [ ] Helpful text is displayed

### Add Friend
- [ ] "Add Friend" button is visible
- [ ] Button click triggers action
- [ ] No crashes when tapped
- [ ] Icon displays correctly

### List Performance
- [ ] List renders 5+ friends smoothly
- [ ] No lag when scrolling
- [ ] Avatar backgrounds render correctly
- [ ] Text is readable and properly styled

---

## 👤 Phase 4: Profile Screen Testing

### Profile Display
- [ ] Navigate to Profile tab
- [ ] Profile screen renders
- [ ] User avatar shows (with initials)
- [ ] User name displays
- [ ] User email displays
- [ ] Avatar background color is correct

### View Mode
- [ ] Profile info is displayed
- [ ] First name is visible
- [ ] Last name is visible
- [ ] Bio field shows (if exists)
- [ ] "Edit Profile" button visible
- [ ] Settings items are visible

### Edit Mode
- [ ] "Edit Profile" button tappable
- [ ] Edit button changes to Save/Cancel
- [ ] Input fields become editable
- [ ] Can type in first name field
- [ ] Can type in last name field
- [ ] Can type in bio field
- [ ] Cursor appears in inputs

### Save/Cancel
- [ ] "Save" button triggers update
- [ ] "Cancel" button reverts changes
- [ ] Form resets to original values on cancel
- [ ] Save button styled correctly
- [ ] Cancel button styled correctly
- [ ] Both buttons work without crashes

### Settings Section
- [ ] Settings items display
- [ ] Each item has icon and label
- [ ] "Notifications" item visible
- [ ] "Privacy & Security" item visible
- [ ] "About" item visible
- [ ] Items are tappable (navigation ready)

### Logout
- [ ] "Logout" button visible
- [ ] Button styled with red/danger color
- [ ] Button is tappable
- [ ] Logout shows confirmation dialog
- [ ] "Cancel" option in dialog works
- [ ] "Logout" option in dialog works
- [ ] Logout clears token
- [ ] Redirects to login screen
- [ ] Cannot navigate back to app after logout

---

## 🔐 Phase 5: Authentication Testing

### Initial Load
- [ ] Check AsyncStorage has token? (if logged in)
- [ ] If token exists, load user data
- [ ] If token missing, show login screen
- [ ] Loading spinner shows during check
- [ ] App doesn't crash if token invalid

### Token Management
- [ ] Token stored in AsyncStorage
- [ ] Token retrieved on app start
- [ ] Token persists after app restart
- [ ] Token cleared on logout
- [ ] New token saved on login

### API Integration
- [ ] API client initializes
- [ ] Axios instance created
- [ ] Base URL configured
- [ ] Interceptors registered
- [ ] Token added to requests automatically
- [ ] All API calls include Authorization header

### Error Handling
- [ ] Network error shows message
- [ ] 401 error handled (token expired)
- [ ] 500 error shows friendly message
- [ ] API failures don't crash app
- [ ] Retry logic works
- [ ] No sensitive info in error logs

---

## 📊 Phase 6: Data & API Testing

### Places Data
- [ ] User's places load correctly
- [ ] Nearby friend places load correctly
- [ ] Place data includes all fields
- [ ] Ratings display correctly
- [ ] Place names are correct
- [ ] Coordinates are valid

### API Requests
- [ ] GET /api/places returns user's places
- [ ] GET /api/places/nearby returns nearby places
- [ ] Requests include JWT token
- [ ] Requests include correct headers
- [ ] Response data is properly formatted
- [ ] Error responses are handled

### API Responses
- [ ] Response status is 200 for success
- [ ] Data is parsed correctly
- [ ] Arrays are not empty (test data exists)
- [ ] Objects have expected properties
- [ ] No undefined/null values in required fields
- [ ] Timestamps are valid

### Data Combination
- [ ] User and friend places combine correctly
- [ ] Filter toggles between datasets
- [ ] Count in info bar is accurate
- [ ] Pins display combined data
- [ ] No duplicate places shown

---

## 🎨 Phase 7: UI/UX Testing

### Visual Design
- [ ] Colors match design (Indigo, Pink, Amber)
- [ ] Spacing is consistent
- [ ] Text is readable
- [ ] Buttons are easily tappable (min 48x48)
- [ ] Icons are clear and visible
- [ ] Layout is responsive

### Typography
- [ ] Headers are larger than body text
- [ ] Font weights are consistent
- [ ] Text contrast meets accessibility standards
- [ ] No text is cut off
- [ ] Multiline text wraps properly

### Interactive Elements
- [ ] Buttons have visual feedback
- [ ] Tapping buttons feels responsive
- [ ] Loading spinners animate smoothly
- [ ] Transitions between screens are smooth
- [ ] Gestures (swipe, pinch) work on map
- [ ] No lag when scrolling lists

### Images & Icons
- [ ] Material icons render correctly
- [ ] Avatar backgrounds display
- [ ] No broken image references
- [ ] Icons are appropriately sized
- [ ] Colors of icons are correct

### Accessibility
- [ ] Button labels are clear
- [ ] Icons have meaningful labels
- [ ] Text colors have enough contrast
- [ ] Touch targets are large enough
- [ ] Form fields are properly labeled

---

## ⚡ Phase 8: Performance Testing

### Load Time
- [ ] App starts in under 5 seconds
- [ ] Initial screen loads quickly
- [ ] No significant delay on screen transitions
- [ ] Maps load within reasonable time
- [ ] Lists don't lag with 20+ items

### Memory
- [ ] No memory leaks detected
- [ ] App doesn't crash after extended use
- [ ] Switching tabs multiple times works
- [ ] No gradual slowdown over time

### Location & Maps
- [ ] Location updates don't freeze UI
- [ ] Map rendering is smooth
- [ ] 50+ markers render without lag
- [ ] Zoom/pan is responsive
- [ ] Filter toggle is instant

### API Calls
- [ ] API requests don't block UI
- [ ] Multiple simultaneous requests work
- [ ] Loading states show appropriately
- [ ] Error states don't cause hangs
- [ ] Retry logic doesn't stack requests

---

## 🐛 Phase 9: Error Handling

### Network Errors
- [ ] App handles no internet gracefully
- [ ] Shows appropriate error message
- [ ] Offers retry option
- [ ] Doesn't crash or freeze
- [ ] Cached data shows if available

### API Errors
- [ ] 400 errors show specific message
- [ ] 401 errors redirect to login
- [ ] 404 errors show "not found"
- [ ] 500 errors show generic message
- [ ] Timeout errors handled
- [ ] Invalid JSON responses handled

### Permission Errors
- [ ] Location permission denied handled
- [ ] Shows helpful message to user
- [ ] Allows retry/settings link
- [ ] App doesn't crash
- [ ] Map shows default location

### Validation Errors
- [ ] Form validation works
- [ ] Invalid input shows error
- [ ] Required fields are checked
- [ ] Error messages are clear
- [ ] Can fix and resubmit

---

## 📱 Phase 10: Device Testing

### iOS Testing
- [ ] App runs on iOS simulator
- [ ] All features work
- [ ] No iOS-specific bugs
- [ ] Safe area handled correctly
- [ ] Status bar doesn't overlap content

### Android Testing
- [ ] App runs on Android emulator
- [ ] All features work
- [ ] No Android-specific bugs
- [ ] Back button works properly
- [ ] Soft keyboard doesn't break layout

### Real Device Testing
- [ ] Location works on real device
- [ ] Maps render correctly
- [ ] Touch interactions feel natural
- [ ] Performance acceptable
- [ ] No crashes during use

---

## 🚀 Phase 11: Documentation

### Code Documentation
- [ ] Main components have comments
- [ ] Complex functions explained
- [ ] API methods documented
- [ ] Hook purposes clear
- [ ] Types are self-documenting

### User Documentation
- [ ] README.md is accurate
- [ ] Setup instructions work
- [ ] Feature descriptions clear
- [ ] Examples are helpful
- [ ] Troubleshooting guide helpful

### Developer Documentation
- [ ] FILE_STRUCTURE.md is current
- [ ] Architecture clear
- [ ] Data flows documented
- [ ] Common tasks explained
- [ ] Code examples provided

### Code Quality
- [ ] No unused imports
- [ ] No console.log statements (debug only)
- [ ] No commented-out code
- [ ] Consistent naming conventions
- [ ] No magic numbers

---

## ✨ Phase 12: Polish & Optimization

### Code Cleanup
- [ ] Remove all console logs
- [ ] Remove unused variables
- [ ] Remove unused functions
- [ ] Clean up commented code
- [ ] Fix any ESLint warnings

### Performance Optimization
- [ ] Memoize expensive components
- [ ] Optimize re-renders
- [ ] Lazy load heavy components
- [ ] Cache API responses
- [ ] Throttle expensive operations

### User Experience Polish
- [ ] Add loading states where needed
- [ ] Add success messages
- [ ] Add helpful error messages
- [ ] Add empty state illustrations
- [ ] Add smooth transitions

### Testing
- [ ] Run through full user flow
- [ ] Test all edge cases
- [ ] Test on different screen sizes
- [ ] Test with poor connection
- [ ] Test with slow device

---

## 🎯 Phase 13: Next Features (Upcoming)

### Priority 1 (Critical)
- [ ] Create login screen
- [ ] Create register screen
- [ ] Connect auth to backend

### Priority 2 (High)
- [ ] Create place-details screen
- [ ] Create add-place screen
- [ ] Implement photo upload

### Priority 3 (Medium)
- [ ] Create search screen
- [ ] Add place categories
- [ ] Add place reviews

### Priority 4 (Low)
- [ ] Add notifications
- [ ] Add sharing functionality
- [ ] Add offline support

---

## 📋 Final Checklist Before Release

### Functionality
- [ ] All core features working
- [ ] All screens render correctly
- [ ] All interactions functional
- [ ] API integration complete
- [ ] Data flows correctly

### Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] Clean code
- [ ] Well documented
- [ ] Performance acceptable

### Testing
- [ ] Manual testing complete
- [ ] User flow testing done
- [ ] Edge cases tested
- [ ] Real device testing done
- [ ] Different OS testing done

### Security
- [ ] No API keys exposed
- [ ] Tokens stored securely
- [ ] Input validation in place
- [ ] Error messages safe
- [ ] No sensitive data logged

### Documentation
- [ ] README.md updated
- [ ] Setup instructions work
- [ ] All features documented
- [ ] Code comments added
- [ ] Developer guide complete

### Release
- [ ] Version number updated
- [ ] Changelog created
- [ ] Build successful
- [ ] App signing configured
- [ ] Ready for app store

---

## 🎉 Completion Status

Track your overall progress:

```
Phase 1: Setup & Verification        □ [  ] Complete
Phase 2: Map Screen Testing          □ [  ] Complete
Phase 3: Friends Screen Testing      □ [  ] Complete
Phase 4: Profile Screen Testing      □ [  ] Complete
Phase 5: Authentication Testing      □ [  ] Complete
Phase 6: Data & API Testing          □ [  ] Complete
Phase 7: UI/UX Testing               □ [  ] Complete
Phase 8: Performance Testing         □ [  ] Complete
Phase 9: Error Handling              □ [  ] Complete
Phase 10: Device Testing             □ [  ] Complete
Phase 11: Documentation              □ [  ] Complete
Phase 12: Polish & Optimization      □ [  ] Complete
Phase 13: Next Features              □ [  ] Complete

Overall: ___/13 Phases Complete
```

---

## 📝 Notes & Observations

Use this space to note any issues or observations:

```
[Date]:
[Issue/Observation]:
[Resolution]:

---

[Date]:
[Issue/Observation]:
[Resolution]:
```

---

## 🆘 Quick Debug Commands

When something doesn't work:

```bash
# Clear everything and restart
npm install --force
npm start -- --clear

# Check what's running
ps aux | grep node

# Kill all node processes
killall node

# Check dependencies
npm list

# Validate TypeScript
npx tsc --noEmit

# See what files changed
git status

# View recent commits
git log --oneline -10
```

---

## 🎓 Learning Checklist

As you code, make sure you understand:

- [ ] How Expo Router works
- [ ] How React Context works for auth
- [ ] How custom hooks encapsulate logic
- [ ] How axios interceptors work
- [ ] How async/await and promises work
- [ ] How React Native styling works
- [ ] How TypeScript interfaces work
- [ ] How location APIs work
- [ ] How Google Maps integration works
- [ ] How API integration works

---

**Mark items as complete as you go!** ✅

Last updated: March 23, 2026
