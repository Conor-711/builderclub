import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Flame, BookOpen, Sparkles, Star, Users, GraduationCap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import type { Course } from './CourseCard';

interface TrendingCoursesCarouselProps {
  courses: Course[];
  onPurchase?: (courseId: string) => void;
}

export function TrendingCoursesCarousel({ courses, onPurchase }: TrendingCoursesCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  // 获取前5个最热门的课程（根据评分和学生数排序）
  const trendingCourses = courses
    .sort((a, b) => {
      const scoreA = a.rating * 0.5 + (a.studentsCount / 1000) * 0.5;
      const scoreB = b.rating * 0.5 + (b.studentsCount / 1000) * 0.5;
      return scoreB - scoreA;
    })
    .slice(0, 5);
  
  if (trendingCourses.length === 0) return null;

  // 自动轮播
  useEffect(() => {
    if (!isAutoPlaying || trendingCourses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % trendingCourses.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, trendingCourses.length]);

  const handlePrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + trendingCourses.length) % trendingCourses.length);
  };

  const handleNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % trendingCourses.length);
  };

  const handleDotClick = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentCourse = trendingCourses[currentIndex];
  const discount = currentCourse.originalPrice 
    ? Math.round((1 - currentCourse.price / currentCourse.originalPrice) * 100)
    : 0;

  // 截取标题为两句话
  const getTwoSentenceTitle = (title: string) => {
    const sentences = title.match(/[^.!?]+[.!?]+/g) || [title];
    const twoSentences = sentences.slice(0, 2).join(' ').trim();
    const maxLength = 150;
    if (twoSentences.length > maxLength) {
      return twoSentences.substring(0, maxLength).trim() + '...';
    }
    return twoSentences || title;
  };

  return (
    <div className="relative mb-8">
      {/* 标题 */}
      <div className="flex items-center gap-2 mb-4">
        <Flame className="w-6 h-6 text-purple-500 animate-pulse" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent">
          Trending Courses
        </h2>
        <Badge variant="secondary" className="ml-2">
          <TrendingUp className="w-3 h-3 mr-1" />
          Top 5
        </Badge>
      </div>

      {/* 轮播主体 */}
      <Card className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-indigo-50/50 to-blue-50 dark:from-purple-950/20 dark:via-indigo-950/10 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800 shadow-xl">
        {/* 背景装饰 */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-indigo-400/20 to-transparent rounded-full blur-3xl" />
        </div>
        
        <div className="relative z-10 p-8 md:p-12">
          {/* 排名徽章 */}
          <div className="absolute top-6 right-6 z-20">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 flex items-center justify-center shadow-2xl ring-4 ring-purple-100 dark:ring-purple-900/50">
                <span className="text-3xl font-black text-white">#{currentIndex + 1}</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 animate-ping opacity-20" />
              <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
          </div>

          {/* 内容区域 */}
          <div className="max-w-4xl mx-auto">
            {/* Course 标题 */}
            <div className="mb-8 relative">
              <div className="absolute -left-4 -top-2 text-6xl text-purple-200 dark:text-purple-900/50 font-serif leading-none">
                "
              </div>
              
              <div className="relative z-10 pl-8">
                <p className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground leading-tight mb-4 tracking-tight">
                  {getTwoSentenceTitle(currentCourse.title)}
                </p>
                
                <div className="w-24 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full mb-6 animate-pulse" />
                
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="outline" className="text-xs px-3 py-1 border-purple-500/50 text-purple-600 dark:text-purple-400">
                    📚 {currentCourse.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-indigo-500/50 text-indigo-600 dark:text-indigo-400">
                    🎓 {currentCourse.level}
                  </Badge>
                  <Badge variant="outline" className="text-xs px-3 py-1 border-blue-500/50 text-blue-600 dark:text-blue-400">
                    ⏱️ {currentCourse.duration}
                  </Badge>
                </div>
              </div>
              
              <div className="absolute -right-4 -bottom-2 text-6xl text-purple-200 dark:text-purple-900/50 font-serif leading-none">
                "
              </div>
            </div>

            {/* 讲师和项目信息 */}
            <div className="space-y-4 mb-6 pb-6 border-b border-purple-200 dark:border-purple-800">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* 讲师信息 */}
                <div className="flex items-center gap-3">
                  <img 
                    src={currentCourse.instructorAvatar}
                    alt={currentCourse.instructor}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-purple-200 dark:ring-purple-800"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">Instructor</p>
                    <p className="font-bold text-foreground">{currentCourse.instructor}</p>
                  </div>
                </div>

                {/* 项目信息 */}
                <div className="flex items-center gap-3">
                  <img 
                    src={currentCourse.projectLogo}
                    alt={currentCourse.projectName}
                    className="w-10 h-10 rounded object-cover"
                  />
                  <div>
                    <p className="text-xs text-muted-foreground">From Project</p>
                    <p className="font-bold text-primary">{currentCourse.projectName}</p>
                  </div>
                </div>
              </div>

              {/* 评分和统计 */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-full border border-purple-200 dark:border-purple-800">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-bold text-lg text-purple-600 dark:text-purple-400">
                    {currentCourse.rating.toFixed(1)}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="w-5 h-5" />
                  <span className="font-semibold">{currentCourse.studentsCount.toLocaleString()} students</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5" />
                  <span className="font-semibold">{currentCourse.lessonsCount} lessons</span>
                </div>
              </div>
            </div>

            {/* 价格和操作按钮 */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  ${currentCourse.price}
                </span>
                {currentCourse.originalPrice && (
                  <div className="space-y-1">
                    <span className="text-lg text-muted-foreground line-through">
                      ${currentCourse.originalPrice}
                    </span>
                    {discount > 0 && (
                      <Badge className="bg-red-500 text-white">
                        Save {discount}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => onPurchase?.(currentCourse.id)}
                  size="lg"
                  className="gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 shadow-lg hover:shadow-xl transition-all hover:scale-105 font-semibold"
                >
                  <GraduationCap className="w-5 h-5" />
                  Purchase Now
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white dark:hover:bg-purple-600 font-semibold transition-all hover:scale-105 shadow-md"
                >
                  <Sparkles className="w-5 h-5" />
                  View Details
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 左右导航按钮 */}
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-purple-500/20 hover:border-purple-500/60 hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Previous course"
        >
          <ChevronLeft className="w-6 h-6 text-foreground group-hover:text-purple-600 transition-colors" />
        </button>

        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-background/80 backdrop-blur-sm border-2 border-purple-500/20 hover:border-purple-500/60 hover:bg-background shadow-lg flex items-center justify-center transition-all hover:scale-110 group"
          aria-label="Next course"
        >
          <ChevronRight className="w-6 h-6 text-foreground group-hover:text-purple-600 transition-colors" />
        </button>

        {/* 进度指示器 */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {trendingCourses.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentIndex
                  ? 'w-8 bg-gradient-to-r from-purple-500 to-indigo-500'
                  : 'w-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to course ${index + 1}`}
            />
          ))}
        </div>

        {/* 自动播放指示器 */}
        {isAutoPlaying && (
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="text-xs">
              Auto-playing
            </Badge>
          </div>
        )}
      </Card>

      {/* 提示文本 */}
      <p className="text-sm text-muted-foreground text-center mt-3">
        📚 Top-rated courses from successful projects • Updates every 5 seconds
      </p>
    </div>
  );
}

