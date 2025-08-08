# CIS Testing App

A comprehensive React application for testing and demonstrating real-time integration with the Content Interaction Service (CIS). This app showcases how frontend applications track user interactions, measure dwell time, and provide real-time analytics using CIS APIs.

## 🚀 Features

### Core Functionality

- **CIS Service Layer**: Complete API integration with retry logic and error handling
- **Custom React Hook**: Easy-to-use interaction tracking with state management
- **Dwell Time Tracking**: Accurate measurement using IntersectionObserver API
- **Real-time Analytics**: Live dashboard with auto-refresh capabilities
- **User Journey Simulation**: Automated testing of complete interaction flows

### Testing Capabilities

- **16 Interaction Types**: All CIS interaction types supported
- **7 Content Types**: Music, video, location, article, podcast, share, recommendation
- **4 Content Locations**: Portal, prompt, chat, direct URL
- **Batch Testing**: Send multiple interactions in single requests
- **Error Simulation**: Test network failures and rate limiting

### UI/UX Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between themes
- **Real-time Feedback**: Immediate visual feedback for all interactions
- **Loading States**: Proper loading indicators for API calls

## 🛠️ Technical Stack

- **Framework**: React 18+ with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React hooks (useState, useEffect, useCallback, useRef)
- **HTTP Client**: Axios with interceptors and retry logic
- **Build Tool**: Vite for fast development
- **Icons**: Lucide React for consistent iconography
- **Package Manager**: npm

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd cis-testing-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the development server**

   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔧 Configuration

The app is configured to connect to a CIS API running on `http://54.198.209.187` with the test token `test-token`. You can modify these settings in:

```typescript
// src/services/CISService.ts
export const cisService = new CISService({
  baseUrl: "http://54.198.209.187",
  authToken: "test-token",
  retryAttempts: 3,
  retryDelay: 1000,
});
```

## 📱 Application Sections

### 1. Testing Panel

- Manual interaction testing with all 16 interaction types
- Content type and location selection
- Batch testing with configurable sizes
- Error simulation tools
- Real-time status indicators

### 2. Analytics Dashboard

- Live analytics with auto-refresh every 5 seconds
- Total interactions, unique content, average dwell time
- Interaction type and content type breakdowns
- Recent interactions feed with filtering
- Visual charts and progress indicators

### 3. User Journey Simulator

- Pre-built journey templates (Music Discovery, Location Exploration, Video Engagement)
- Step-by-step progress indication
- Realistic timing between interactions
- Journey completion metrics
- Customizable journey steps

### 4. Content Gallery

- Sample content cards for all content types
- Automatic dwell time tracking
- Interactive buttons for each content type
- Real-world usage patterns demonstration
- Content filtering by type

## 🔌 API Integration

### Supported Endpoints

- `POST /cis/interactions` - Single interaction tracking
- `POST /cis/interactions/batch` - Batch interaction tracking
- `GET /cis/interactions/my` - User analytics
- `GET /cis/interactions/content/{id}` - Content analytics

### Interaction Types

1. **opens** - Content thumbnail appears
2. **views** - Full screen content viewing
3. **saves** - Bookmarking content
4. **opens_detail** - Detailed content view
5. **opens_outbound_link_web** - External web links
6. **opens_outbound_app** - External app links
7. **taps_call_cta** - Call-to-action buttons
8. **taps_directions_cta** - Navigation buttons
9. **starts_audio** - Audio playback initiation
10. **plays_entire_audio** - Complete audio consumption
11. **shares_genie** - In-app sharing
12. **shares_ios** - Native iOS sharing
13. **takes_screenshot** - Screenshot capture
14. **requests_reminder** - Reminder setting
15. **asks_follow_up** - Content-specific questions
16. **repeat_views** - Subsequent content views

### Content Types

- **recommendation** - AI-powered recommendations
- **location** - Physical locations and businesses
- **music** - Audio content and tracks
- **video** - Video content and streams
- **podcast** - Podcast episodes
- **article** - Text-based content
- **share** - User-shared content

## 🎯 Usage Examples

### Basic Interaction Tracking

```typescript
import { useCIS } from "./hooks/useCIS";

const MyComponent = () => {
  const { trackInteraction } = useCIS();

  const handleClick = async () => {
    await trackInteraction(
      "content-123",
      "music",
      "portal",
      "opens",
      30, // dwell time in seconds
      { user_id: "user-456" }
    );
  };

  return <button onClick={handleClick}>Track Interaction</button>;
};
```

### Dwell Time Tracking

```typescript
import { useCIS } from "./hooks/useCIS";

const ContentCard = ({ contentId }) => {
  const { startDwellTracking, getDwellTime } = useCIS();
  const cardRef = useRef(null);

  useEffect(() => {
    if (cardRef.current) {
      startDwellTracking(contentId, cardRef);
    }
  }, [contentId]);

  return <div ref={cardRef}>Content Card</div>;
};
```

### Batch Testing

```typescript
import { useCIS } from "./hooks/useCIS";

const BatchTester = () => {
  const { trackBatchInteractions } = useCIS();

  const runBatchTest = async () => {
    const interactions = [
      // ... array of interaction objects
    ];
    await trackBatchInteractions(interactions);
  };

  return <button onClick={runBatchTest}>Run Batch Test</button>;
};
```

## 🧪 Testing Scenarios

### Basic Testing

1. Click individual interaction buttons in the Testing Panel
2. Verify successful tracking in the Analytics Dashboard
3. Check interaction history for status updates

### Dwell Time Testing

1. Navigate to Content Gallery
2. Hover over content cards to start dwell tracking
3. Move away to stop tracking
4. Verify dwell time is captured in interactions

### Batch Testing

1. Open Advanced options in Testing Panel
2. Set batch size (1-100)
3. Click "Test X Interactions"
4. Monitor progress in real-time

### User Journey Testing

1. Select a journey template
2. Click "Start Journey Simulation"
3. Watch step-by-step execution
4. Review completion metrics

### Error Testing

1. Use "Simulate Network Failure" button
2. Use "Simulate Rate Limit" button
3. Verify error handling and retry logic

## 🔍 Performance Features

- **Optimized Bundle**: Vite for fast builds and HMR
- **Efficient API Calls**: Proper caching and request optimization
- **Memory Management**: Clean up observers and timers
- **Batch Processing**: Support for large interaction batches
- **Real-time Updates**: Minimal re-renders with optimized state management

## 🎨 Customization

### Styling

The app uses Tailwind CSS with custom component classes. You can modify:

- Color schemes in `tailwind.config.js`
- Component styles in `src/index.css`
- Individual component styling

### Configuration

- API endpoints in `CISService.ts`
- Auto-refresh intervals in `useCIS.ts`
- Journey templates in `UserJourneySimulator.tsx`
- Sample content in `ContentCards.tsx`

## 🚨 Error Handling

The application includes comprehensive error handling:

- Network failure detection and retry logic
- Rate limiting handling
- Invalid data validation
- User-friendly error messages
- Graceful degradation

## 📊 Analytics Features

- Real-time interaction tracking
- Dwell time measurement
- Content engagement metrics
- User journey analysis
- Performance monitoring
- Error rate tracking

## 🔐 Security

- Bearer token authentication
- Secure API communication
- Input validation
- Error message sanitization

## 📈 Future Enhancements

- Advanced analytics visualizations
- Custom journey builder
- A/B testing capabilities
- Performance benchmarking
- Export functionality
- Multi-user support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Check the documentation
- Review the code comments
- Open an issue on GitHub

---

**Built with ❤️ for CIS testing and development**
