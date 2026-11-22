import os
from PIL import Image, ImageFilter, ImageEnhance

def generate_all_icons():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    source_img_path = os.path.join(base_dir, "icons", "master_gamer_icon.png")
    target_dir = os.path.join(base_dir, "icons")
    
    if not os.path.exists(source_img_path):
        print(f"Error: Source image not found at {source_img_path}")
        return
        
    os.makedirs(target_dir, exist_ok=True)
    
    try:
        master_img = Image.open(source_img_path).convert('RGBA')
        sizes = [16, 32, 48, 128, 256, 512]
        
        for size in sizes:
            target_path = os.path.join(target_dir, f"icon{size}.png")
            resized = master_img.resize((size, size), Image.Resampling.LANCZOS)
            
            # Micro-size optimizations for Chrome toolbar sharpness
            if size <= 48:
                r, g, b, a = resized.split()
                rgb = Image.merge('RGB', (r, g, b))
                if size == 16:
                    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.8, percent=280, threshold=2))
                    rgb = ImageEnhance.Contrast(rgb).enhance(1.3)
                    rgb = ImageEnhance.Color(rgb).enhance(1.35)
                elif size == 32:
                    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.5, percent=220, threshold=2))
                    rgb = ImageEnhance.Contrast(rgb).enhance(1.2)
                    rgb = ImageEnhance.Color(rgb).enhance(1.25)
                elif size == 48:
                    rgb = rgb.filter(ImageFilter.UnsharpMask(radius=1.2, percent=180, threshold=2))
                    rgb = ImageEnhance.Contrast(rgb).enhance(1.15)
                
                r2, g2, b2 = rgb.split()
                resized = Image.merge('RGBA', (r2, g2, b2, a))
            
            resized.save(target_path, "PNG", optimize=True)
            print(f"[OK] Generated: {target_path} ({size}x{size})")
            
        print("\n[SUCCESS] Todos los iconos de la extensión han sido actualizados con el logo gamer morado oficial!")
    except Exception as e:
        print(f"[ERROR] Error generando iconos: {e}")

if __name__ == "__main__":
    generate_all_icons()
