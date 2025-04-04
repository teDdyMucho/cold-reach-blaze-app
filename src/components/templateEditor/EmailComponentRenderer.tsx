import { cn } from "@/lib/utils";
import { EmailComponent } from "@/types";

interface EmailComponentRendererProps {
  component: EmailComponent;
  isSelected?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
}

const EmailComponentRenderer = ({ 
  component, 
  isSelected, 
  onDragStart, 
  onDragOver, 
  onDrop 
}: EmailComponentRendererProps) => {
  const { type, content, styles, id } = component;

  // Convert styles object to CSS style object
  const getCssStyles = (styleObj: Record<string, any>) => {
    const cssStyles: Record<string, string | number> = {};
    
    // Process special styles like paddingX and paddingY
    if (styleObj.paddingX !== undefined) {
      cssStyles.paddingLeft = `${styleObj.paddingX}px`;
      cssStyles.paddingRight = `${styleObj.paddingX}px`;
    }
    
    if (styleObj.paddingY !== undefined) {
      cssStyles.paddingTop = `${styleObj.paddingY}px`;
      cssStyles.paddingBottom = `${styleObj.paddingY}px`;
    }
    
    // Add all other styles
    Object.entries(styleObj).forEach(([key, value]) => {
      if (key !== 'paddingX' && key !== 'paddingY') {
        cssStyles[key] = value;
      }
    });
    
    return cssStyles;
  };

  const componentWrapperClass = cn(
    "relative mb-2 group",
    isSelected ? "outline-2 outline-dashed outline-blue-500" : "outline-1 outline-dashed outline-gray-300 hover:outline-gray-400",
    "transition-all duration-150 ease-in-out"
  );

  const renderComponent = () => {
    switch (type) {
      case 'text':
        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => onDragOver && onDragOver(e)}
            onDrop={(e) => onDrop && onDrop(e)}
          >
            <div style={getCssStyles(styles)}>
              {content}
            </div>
          </div>
        );
        
      case 'button':
        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => onDragOver && onDragOver(e)}
            onDrop={(e) => onDrop && onDrop(e)}
          >
            <div 
              className="inline-block"
              style={{ textAlign: styles.textAlign || 'center', width: '100%' }}
            >
              <a 
                href={component.url || '#'}
                style={getCssStyles(styles)}
                className="inline-block"
                onClick={(e) => e.preventDefault()}
              >
                {content}
              </a>
            </div>
          </div>
        );
        
      case 'image':
        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => onDragOver && onDragOver(e)}
            onDrop={(e) => onDrop && onDrop(e)}
          >
            <div style={{ textAlign: styles.textAlign || 'center' }}>
              <img 
                src={component.src || 'https://placehold.co/600x200/e2e8f0/1e40af?text=Image'} 
                alt={component.alt || 'Image'} 
                style={getCssStyles(styles)}
              />
            </div>
          </div>
        );
        
      case 'container':
        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDragOver && onDragOver(e);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDrop && onDrop(e);
            }}
          >
            <div style={getCssStyles(styles)}>
              {content}
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 opacity-0 group-hover:opacity-100">
                Container
              </div>
            </div>
          </div>
        );
        
      case 'columns':
        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDragOver && onDragOver(e);
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDrop && onDrop(e);
            }}
          >
            <div 
              style={getCssStyles(styles)}
              className="flex flex-wrap"
            >
              {component.columns?.map((column, index) => (
                <div 
                  key={index} 
                  style={getCssStyles(column.styles)}
                  className="outline-1 outline-dashed outline-gray-300 p-2 min-h-[100px]"
                >
                  {column.components?.map((comp) => (
                    <EmailComponentRenderer 
                      key={comp.id} 
                      component={comp}
                      isSelected={false}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDrop={onDrop}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-0 left-0 bg-blue-500 text-white text-xs px-1 opacity-0 group-hover:opacity-100">
                Columns
              </div>
            </div>
          </div>
        );
        
      case 'divider':
        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => onDragOver && onDragOver(e)}
            onDrop={(e) => onDrop && onDrop(e)}
          >
            <hr style={getCssStyles(styles)} />
          </div>
        );
        
      case 'spacer':
        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => onDragOver && onDragOver(e)}
            onDrop={(e) => onDrop && onDrop(e)}
          >
            <div style={{ ...getCssStyles(styles), minHeight: '20px' }}></div>
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs opacity-0 group-hover:opacity-100">
              Spacer
            </div>
          </div>
        );
        
      case 'text-image':
        const containerStyles = {
          ...getCssStyles(styles),
          display: 'flex',
          alignItems: styles.alignItems || 'center',
          gap: '20px',
          flexDirection: styles.flexDirection || 'row',
        };

        const imageStyles = {
          ...getCssStyles(component.imageStyles || {}),
          width: component.imageWidth || '50%',
          order: component.imagePosition === 'right' ? 2 : 1
        };
        
        const textStyles = {
          ...getCssStyles(component.textStyles || {}),
          width: '50%',
          order: component.imagePosition === 'right' ? 1 : 2
        };

        return (
          <div 
            className={componentWrapperClass}
            draggable={true}
            onDragStart={(e) => onDragStart && onDragStart(e, id)}
            onDragOver={(e) => onDragOver && onDragOver(e)}
            onDrop={(e) => onDrop && onDrop(e)}
          >
            <div style={containerStyles}>
              <div style={textStyles}>
                {content}
              </div>
              <img 
                src={component.src || "https://placehold.co/600x400"}
                alt={component.alt || ""}
                style={imageStyles}
              />
            </div>
          </div>
        );
        
      default:
        return null;
    }
  };

  return renderComponent();
};

export default EmailComponentRenderer;