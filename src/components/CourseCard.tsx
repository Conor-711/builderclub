import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { BookOpen, Users, Star, Clock, DollarSign } from 'lucide-react';

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  instructorAvatar: string;
  projectName: string;
  projectLogo: string;
  price: number;
  originalPrice?: number;
  rating: number;
  studentsCount: number;
  duration: string; // e.g., "2.5 hours"
  lessonsCount: number;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnail: string;
  tags: string[];
}

interface CourseCardProps {
  course: Course;
  onPurchase?: (courseId: string) => void;
}

export function CourseCard({ course, onPurchase }: CourseCardProps) {
  const discount = course.originalPrice 
    ? Math.round((1 - course.price / course.originalPrice) * 100)
    : 0;

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col h-full group cursor-pointer">
      {/* Course Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <img 
          src={course.thumbnail} 
          alt={course.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-red-500 text-white font-bold">
              -{discount}%
            </Badge>
          </div>
        )}
        {/* Level Badge */}
        <div className="absolute top-3 left-3">
          <Badge className={getLevelColor(course.level)}>
            {course.level}
          </Badge>
        </div>
      </div>
      
      {/* Course Info */}
      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Project Badge */}
        <div className="flex items-center gap-2">
          <img 
            src={course.projectLogo} 
            alt={course.projectName}
            className="w-5 h-5 rounded object-cover"
          />
          <span className="text-xs font-medium text-primary">{course.projectName}</span>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] leading-tight">
          {course.title}
        </h3>
        
        {/* Instructor */}
        <div className="flex items-center gap-2">
          <img 
            src={course.instructorAvatar}
            alt={course.instructor}
            className="w-6 h-6 rounded-full object-cover"
          />
          <span className="text-xs text-muted-foreground">{course.instructor}</span>
        </div>

        {/* Rating and Stats */}
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{course.rating.toFixed(1)}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Users className="w-3.5 h-3.5" />
            <span>{course.studentsCount.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{course.duration}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {course.tags.slice(0, 2).map((tag, idx) => (
            <Badge key={idx} variant="secondary" className="text-xs px-2 py-0">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Price and Purchase Button */}
        <div className="mt-auto pt-3 border-t space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-primary">
                ${course.price}
              </span>
              {course.originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${course.originalPrice}
                </span>
              )}
            </div>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </div>
          
          <Button 
            onClick={(e) => {
              e.stopPropagation();
              onPurchase?.(course.id);
            }}
            className="w-full"
            size="sm"
          >
            <DollarSign className="w-4 h-4 mr-1" />
            Purchase Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

