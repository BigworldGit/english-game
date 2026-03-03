"""
PNG图片背景透明化处理
处理两种情况：1) 图片有Alpha通道 2) 图片无Alpha通道
"""

from PIL import Image
import numpy as np


def make_background_transparent(input_path: str, output_path: str, 
                                threshold: int = 240,
                                diff_threshold: int = 30):
    """
    使PNG图片背景透明
    
    Args:
        input_path: 输入图片路径
        output_path: 输出图片路径
        threshold: 透明度阈值 (0-255)，大于此值的像素设为完全透明
        diff_threshold: 颜色差异阈值，用于无Alpha通道的图片
    
    处理逻辑:
        1. 有Alpha通道: 使用阈值方法，将亮度高的像素变透明
        2. 无Alpha通道: 使用颜色差异方法，检测与背景色的差异
    """
    img = Image.open(input_path)
    img = img.convert('RGBA')  # 转换为RGBA模式
    
    # 获取Alpha通道数据
    alpha = img.split()[3]
    
    # ===== 情况1: 图片有Alpha通道 =====
    if alpha is not None:
        print(f"检测到Alpha通道，使用阈值方法...")
        # 将接近白色/亮度高的像素变为完全透明
        pixels = alpha.load()
        width, height = alpha.size
        for y in range(height):
            for x in range(width):
                pixel = pixels[x, y]
                # 如果像素值大于阈值，设为完全透明
                if pixel > threshold:
                    pixels[x, y] = 0
    
    # ===== 情况2: 图片无Alpha通道 (RGB模式) =====
    else:
        print(f"无Alpha通道，使用颜色差异方法...")
        # 获取RGB数据
        r, g, b = img.split()[:3]
        
        # 将RGB转换为数组
        arr = np.array(img)
        
        # 计算每个像素与左上角像素的差异（假设左上角是背景色）
        bg_color = arr[0, 0][:3]  # 背景颜色
        
        # 计算欧氏距离
        diff = np.sqrt(np.sum((arr[:, :, :3] - bg_color) ** 2, axis=2))
        
        # 创建Alpha通道：差异小的设为透明(0)，差异大的保留(255)
        alpha_channel = np.where(diff < diff_threshold, 0, 255).astype(np.uint8)
        
        # 合并Alpha通道
        arr[:, :, 3] = alpha_channel
        img = Image.fromarray(arr, 'RGBA')
    
    img.save(output_path, 'PNG')
    print(f"✅ 已保存: {output_path}")
    return img


def make_white_background_transparent(input_path: str, output_path: str):
    """
    快速方法：将白色背景设为透明
    适用于背景为纯白或接近白色的图片
    """
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img)
    
    # 将白色 (RGB > 250) 的像素设为透明
    mask = (arr[:, :, 0] > 250) & (arr[:, :, 1] > 250) & (arr[:, :, 2] > 250)
    arr[:, :, 3][mask] = 0
    
    result = Image.fromarray(arr, 'RGBA')
    result.save(output_path, 'PNG')
    print(f"✅ 白色背景已移除: {output_path}")
    return result


def make_black_background_transparent(input_path: str, output_path: str):
    """
    快速方法：将黑色背景设为透明
    适用于背景为纯黑或接近黑色的图片
    """
    img = Image.open(input_path).convert('RGBA')
    arr = np.array(img)
    
    # 将黑色 (RGB < 10) 的像素设为透明
    mask = (arr[:, :, 0] < 10) & (arr[:, :, 1] < 10) & (arr[:, :, 2] < 10)
    arr[:, :, 3][mask] = 0
    
    result = Image.fromarray(arr, 'RGBA')
    result.save(output_path, 'PNG')
    print(f"✅ 黑色背景已移除: {output_path}")
    return result


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 3:
        print("用法:")
        print("  python transparent.py <输入图片> <输出图片> [阈值]")
        print("示例:")
        print("  python transparent.py input.png output.png")
        print("  python transparent.py input.png output.png 200")
    else:
        input_file = sys.argv[1]
        output_file = sys.argv[2]
        threshold = int(sys.argv[3]) if len(sys.argv) > 3 else 240
        
        make_background_transparent(input_file, output_file, threshold)
