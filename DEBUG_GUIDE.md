# 🐛 Debug Guide for Prompt Tracer

## Common Issues and Solutions

### **Extension Not Loading**
**Symptoms**: Extension doesn't appear in chrome://extensions/
**Solutions**:
1. Check if all files are present in the folder
2. Verify manifest.json is valid JSON
3. Look for errors in the extensions page

### **Extension Loads But Doesn't Work**
**Symptoms**: Extension appears but no analysis panels show up
**Solutions**:
1. **Check Console for Errors**:
   - Press F12 to open Developer Tools
   - Go to Console tab
   - Look for red error messages
   - Common errors: "Cannot read property of null", "Permission denied"

2. **Check if Content Script is Injecting**:
   - Go to a supported site (chat.openai.com)
   - Open Developer Tools → Console
   - You should see: "Prompt Tracer: Initialized for gpt"

3. **Check Permissions**:
   - Go to chrome://extensions/
   - Find Prompt Tracer
   - Click "Details"
   - Ensure all permissions are granted

### **No Analysis Panel Appearing**
**Symptoms**: Typing prompts but no floating panel shows
**Solutions**:
1. **Check Platform Detection**:
   - Make sure you're on a supported site
   - Currently supports: chat.openai.com, claude.ai, x.ai, gemini.google.com

2. **Check Text Detection**:
   - Ensure you're typing in a textarea or contenteditable element
   - Try clicking the floating 🔍 button manually

3. **Check if Extension is Enabled**:
   - Go to chrome://extensions/
   - Make sure Prompt Tracer is toggled ON

### **Popup Not Working**
**Symptoms**: Clicking extension icon shows blank or broken popup
**Solutions**:
1. **Check popup.html and popup.js**:
   - Ensure both files exist
   - Check for JavaScript errors in popup console

2. **Check Background Script**:
   - Go to chrome://extensions/
   - Find Prompt Tracer
   - Click "Service Worker" link
   - Check for errors in background script console

### **Data Not Saving**
**Symptoms**: Prompts analyzed but not showing in history
**Solutions**:
1. **Check Storage Permissions**:
   - Extension needs "storage" permission
   - Check manifest.json has correct permissions

2. **Check Background Script**:
   - Look for errors in background script console
   - Verify storage functions are working

## Testing Checklist

### ✅ Basic Functionality
- [ ] Extension loads without errors
- [ ] Extension icon appears in toolbar
- [ ] Popup opens when clicking icon
- [ ] Test page (test.html) works locally

### ✅ Platform Detection
- [ ] Works on ChatGPT (chat.openai.com)
- [ ] Works on Claude (claude.ai)
- [ ] Works on Grok (x.ai) - if available
- [ ] Works on Gemini (gemini.google.com)

### ✅ Prompt Analysis
- [ ] Floating panel appears when typing
- [ ] Score is calculated (0-100)
- [ ] Issues are identified correctly
- [ ] Optimized version is suggested
- [ ] Manual analysis button works

### ✅ Data Management
- [ ] Prompts are saved to history
- [ ] Analytics are calculated correctly
- [ ] Export function works
- [ ] Clear history function works
- [ ] Settings can be changed

### ✅ UI/UX
- [ ] Floating panel looks good
- [ ] Popup interface is responsive
- [ ] No console errors
- [ ] Smooth animations and transitions

## Console Commands for Testing

Open Developer Tools (F12) and try these commands:

```javascript
// Check if extension is loaded
chrome.runtime.getManifest()

// Check storage
chrome.storage.local.get(['promptHistory'], console.log)

// Test message passing
chrome.runtime.sendMessage({action: 'getAnalytics'}, console.log)
```

## Common Error Messages

### "Cannot read property 'value' of null"
- **Cause**: Content script can't find textarea
- **Solution**: Check if platform selectors are correct

### "Permission denied"
- **Cause**: Extension doesn't have required permissions
- **Solution**: Check manifest.json permissions

### "Service worker not found"
- **Cause**: Background script not loading
- **Solution**: Check background.js file and manifest.json

### "Content script not injected"
- **Cause**: URL doesn't match manifest patterns
- **Solution**: Check host_permissions in manifest.json

## Getting Help

If you encounter issues:

1. **Check the console** for error messages
2. **Verify all files** are present and correct
3. **Test on different platforms** to isolate the issue
4. **Check Chrome extension documentation** for common issues
5. **Try reloading the extension** in chrome://extensions/

## Performance Tips

- The extension should be lightweight and fast
- Analysis should happen in real-time
- Storage operations should be non-blocking
- UI should be responsive and smooth 