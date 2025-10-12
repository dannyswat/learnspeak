import { useAuth } from '../hooks/useAuth';
import TopicDetail from './TopicDetail';
import TopicLearner from './TopicLearner';

/**
 * TopicRouter - Routes to appropriate topic page based on user role
 * 
 * Teachers/Admins → TopicDetail (management-focused)
 * Learners → TopicLearner (activity-focused)
 */
const TopicRouter = () => {
  const { user } = useAuth();
  
  // Check if user has teacher or admin role
  const isTeacherOrAdmin = user?.roles.some(
    (role: string) => role === 'teacher' || role === 'admin'
  );

  // Route to appropriate component based on role
  if (isTeacherOrAdmin) {
    return <TopicDetail />;
  }

  return <TopicLearner />;
};

export default TopicRouter;
