"""
INVAMAX Centralized Metadata & Open Graph Automation Engine
Author: INVAMAX Engineering
Description: Automatically inspects, standardizes, and injects server-rendered
             Open Graph, Twitter Cards, Canonical links, Hreflang alternates,
             and Schema.org Article JSON-LD structured data into all articles.
"""

import os
import re
import sys
import json
import urllib.request
from PIL import Image

BASE_URL = "https://invamax.com"

# REGISTRY OF ALL ARTICLES AND CASE STUDIES
ARTICLE_REGISTRY = {
    "article-hieu-ve-lean-manufacturing": {
        "og_image": "assets/images/og/og-lean-10-minutes.jpg",
        "date_published": "2026-10-23",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "Hiểu về Lean Manufacturing trong 10 phút | INVAMAX",
            "desc": "Lean không chỉ là loại bỏ lãng phí. Đó là phương pháp tư duy và tổ chức vận hành giúp nhà máy tạo ra nhiều giá trị hơn với ít nguồn lực hơn.",
            "category": "Lean & Cải tiến",
            "path": "/vi/article-hieu-ve-lean-manufacturing.html",
            "image_alt": "Hiểu về Lean Manufacturing trong 10 phút - INVAMAX"
        },
        "en": {
            "title": "Understanding Lean Manufacturing in 10 Minutes | INVAMAX",
            "desc": "Lean is more than eliminating waste. It is an operational mindset and system design philosophy enabling factories to generate greater customer value with fewer resources.",
            "category": "Lean & Improvement",
            "path": "/en/article-hieu-ve-lean-manufacturing.html",
            "image_alt": "Understanding Lean Manufacturing in 10 Minutes - INVAMAX"
        }
    },
    "article-5-buoc-trien-khai-lean": {
        "og_image": "assets/images/og/og-5-buoc-lean.jpg",
        "date_published": "2026-10-12",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "5 bước triển khai Lean hiệu quả tại nhà máy sản xuất | INVAMAX",
            "desc": "Hướng dẫn thực tế từ các dự án triển khai Lean, giúp doanh nghiệp cải thiện năng suất và giảm lãng phí bền vững.",
            "category": "Lean & Cải tiến",
            "path": "/vi/article-5-buoc-trien-khai-lean.html",
            "image_alt": "5 bước triển khai Lean hiệu quả tại nhà máy - INVAMAX"
        },
        "en": {
            "title": "5 Steps to Effective Lean Manufacturing Implementation | INVAMAX",
            "desc": "Practical guidance from plant deployments: how to implement Lean manufacturing, eliminate shopfloor waste, and achieve sustainable productivity gains.",
            "category": "Lean & Improvement",
            "path": "/en/article-5-buoc-trien-khai-lean.html",
            "image_alt": "5 Steps to Effective Lean Manufacturing Implementation - INVAMAX"
        }
    },
    "article-chi-so-oee": {
        "og_image": "assets/images/og/og-chi-so-oee.jpg",
        "date_published": "2026-10-10",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "Chỉ số OEE: Cách đo lường và cải thiện hiệu quả thiết bị | INVAMAX",
            "desc": "Hiểu đúng về OEE, cách tính ba chỉ số thành phần (Availability, Performance, Quality), phân tích 6 tổn thất lớn và cách cải thiện hiệu quả thiết bị.",
            "category": "Quản trị nhà máy",
            "path": "/vi/article-chi-so-oee.html",
            "image_alt": "Chỉ số OEE: Cách đo lường và cải thiện hiệu quả thiết bị - INVAMAX"
        },
        "en": {
            "title": "OEE Metric: How to Measure and Improve Equipment Effectiveness | INVAMAX",
            "desc": "Master OEE (Overall Equipment Effectiveness): calculating Availability, Performance, Quality, diagnosing the Six Big Losses, and practical steps to maximize equipment yield.",
            "category": "Plant Management",
            "path": "/en/article-chi-so-oee.html",
            "image_alt": "OEE Metric: How to Measure and Improve Equipment Effectiveness - INVAMAX"
        }
    },
    "article-ung-dung-ai": {
        "og_image": "assets/images/og/og-ung-dung-ai.jpg",
        "date_published": "2026-10-08",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "Ứng dụng AI trong sản xuất: Cơ hội và lộ trình triển khai | INVAMAX",
            "desc": "Những ứng dụng thực tế của AI trong sản xuất (AI Vision, Predictive Maintenance, điều độ sản xuất) và gợi ý lộ trình phù hợp cho doanh nghiệp Việt Nam.",
            "category": "Digital & AI",
            "path": "/vi/article-ung-dung-ai.html",
            "image_alt": "Ứng dụng AI trong sản xuất: Cơ hội và lộ trình triển khai - INVAMAX"
        },
        "en": {
            "title": "AI in Manufacturing: Opportunities & Implementation Roadmap | INVAMAX",
            "desc": "Explore practical AI applications in manufacturing (AI Vision, predictive maintenance, scheduling, analytics) and an actionable implementation roadmap for Vietnamese factories.",
            "category": "Digital & AI",
            "path": "/en/article-ung-dung-ai.html",
            "image_alt": "AI in Manufacturing: Opportunities & Implementation Roadmap - INVAMAX"
        }
    },
    "article-10-co-hoi-giam-chi-phi": {
        "og_image": "assets/images/og/og-10-co-hoi-giam-chi-phi.jpg",
        "date_published": "2026-09-28",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "10 cơ hội giảm chi phí sản xuất nhanh chóng | INVAMAX",
            "desc": "Những giải pháp cost down có thể bắt đầu triển khai trong 3–6 tháng, tập trung loại bỏ lãng phí, tối ưu dòng chảy và kiểm soát định mức tiêu hao.",
            "category": "Quản trị chi phí",
            "path": "/vi/article-10-co-hoi-giam-chi-phi.html",
            "image_alt": "10 cơ hội giảm chi phí sản xuất nhanh chóng - INVAMAX"
        },
        "en": {
            "title": "10 Fast-Track Opportunities for Manufacturing Cost Reduction | INVAMAX",
            "desc": "Practical Cost Down solutions deployable within 3–6 months to eliminate shop-floor waste, optimize material usage, streamline flow, and improve operational margin.",
            "category": "Cost Management",
            "path": "/en/article-10-co-hoi-giam-chi-phi.html",
            "image_alt": "10 Fast-Track Opportunities for Manufacturing Cost Reduction - INVAMAX"
        }
    },
    "article-fos-la-gi": {
        "og_image": "assets/images/og/og-fos-la-gi.jpg",
        "date_published": "2026-08-15",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "INVAMAX FOS™ là gì? Bản chất của Hệ điều hành nhà máy | INVAMAX",
            "desc": "Khám phá khái niệm Hệ điều hành nhà máy (Factory Operating System) và tại sao sản xuất tinh gọn cần bắt đầu từ việc xây nền vững trước khi cải tiến.",
            "category": "Hệ điều hành FOS",
            "path": "/vi/article-fos-la-gi.html",
            "image_alt": "INVAMAX FOS™ là gì? Bản chất của Hệ điều hành nhà máy - INVAMAX"
        },
        "en": {
            "title": "What Is INVAMAX FOS™? Building the Operating Foundation for a Factory | INVAMAX",
            "desc": "Discover the concept of a Factory Operating System and why lean operations start with building a solid foundation before advancing into continuous improvement.",
            "category": "Operating System FOS",
            "path": "/en/article-fos-la-gi.html",
            "image_alt": "What Is INVAMAX FOS™? Building the Operating Foundation for a Factory - INVAMAX"
        }
    },
    "article-6-noi-dau": {
        "og_image": "assets/images/og/og-6-noi-dau.jpg",
        "date_published": "2026-08-16",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "6 Nỗi đau của nhà máy thiếu nền & Lý do Lean thất bại | INVAMAX",
            "desc": "Chẩn đoán 6 vấn đề kinh niên khiến các nỗ lực cải tiến Lean thất bại và cách thiết lập nền tảng chuẩn hóa giúp vận hành ổn định và bền vững.",
            "category": "Quản trị vận hành",
            "path": "/vi/article-6-noi-dau.html",
            "image_alt": "6 Nỗi đau của nhà máy thiếu nền & Lý do Lean thất bại - INVAMAX"
        },
        "en": {
            "title": "Why Lean Improvements Fail Without an Operating Foundation | INVAMAX",
            "desc": "Diagnose the chronic diseases of manufacturing and understand why many improvement projects only achieve temporary results without a solid operating foundation.",
            "category": "Operations Management",
            "path": "/en/article-6-noi-dau.html",
            "image_alt": "Why Lean Improvements Fail Without an Operating Foundation - INVAMAX"
        }
    },
    "article-lean-va-dao": {
        "og_image": "assets/images/og/og-lean-va-dao.jpg",
        "date_published": "2026-08-18",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "Góc tư tưởng INVAMAX FOS: Sự kết hợp Lean và Đạo | INVAMAX",
            "desc": "Sự kết hợp giữa công cụ tối ưu hóa phương Tây và triết lý Đạo phương Đông trong quản trị vận hành nhà máy bền vững, uyển chuyển và tự nhiên.",
            "category": "Triết lý vận hành",
            "path": "/vi/article-lean-va-dao.html",
            "image_alt": "Góc tư tưởng INVAMAX FOS: Sự kết hợp Lean và Đạo - INVAMAX"
        },
        "en": {
            "title": "Lean and Tao: A Management Philosophy Behind INVAMAX FOS™ | INVAMAX",
            "desc": "The secret of blending modern Western optimization tools with the calm and profound adaptive philosophy of the East in factory management.",
            "category": "Philosophy & Culture",
            "path": "/en/article-lean-va-dao.html",
            "image_alt": "Lean and Tao: A Management Philosophy Behind INVAMAX FOS™ - INVAMAX"
        }
    },
    "case-study-productivity-improvement-pencil-factory": {
        "og_image": "assets/images/og/og-cs-productivity-pencil.jpg",
        "date_published": "2026-09-10",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "Case Study: Tăng 42,3% năng suất nhà máy sản xuất bút chì | INVAMAX",
            "desc": "Case study cải tiến năng suất tại nhà máy sản xuất bút chì: tăng năng suất lao động từ 742 lên 1.056 UPH trong giai đoạn 2022–2025 thông qua cải tiến hệ thống vận hành.",
            "category": "Case Study",
            "path": "/vi/case-study/productivity-improvement-pencil-factory.html",
            "image_alt": "Case Study: Tăng 42,3% năng suất nhà máy sản xuất bút chì - INVAMAX"
        },
        "en": {
            "title": "Case Study: 42.3% Productivity Increase at Pencil Factory | INVAMAX",
            "desc": "Case study on productivity improvement at a pencil factory: direct labor productivity increased from 742 to 1,056 UPH through operational system optimization.",
            "category": "Case Study",
            "path": "/en/case-study/productivity-improvement-pencil-factory.html",
            "image_alt": "Case Study: 42.3% Productivity Increase at Pencil Factory - INVAMAX"
        }
    },
    "case-study-kaizen-cost-saving-pencil-factory": {
        "og_image": "assets/images/og/og-cs-kaizen-cost-saving.jpg",
        "date_published": "2026-09-15",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "Case Study: 432.873 USD giá trị cải tiến tại nhà máy sản xuất bút chì | INVAMAX",
            "desc": "Case study Kaizen tại nhà máy sản xuất bút chì với 432.873 USD/năm giá trị cải tiến được ghi nhận trong giai đoạn 2022–2025 từ tối ưu nhân lực, dòng chảy, thiết bị và vật tư.",
            "category": "Case Study",
            "path": "/vi/case-study/kaizen-cost-saving-pencil-factory.html",
            "image_alt": "Case Study: 432.873 USD giá trị cải tiến tại nhà máy sản xuất bút chì - INVAMAX"
        },
        "en": {
            "title": "Case Study: 432,873 USD Cost Improvement at Pencil Factory | INVAMAX",
            "desc": "Kaizen Case study at a pencil manufacturing plant with 432,873 USD/year recorded improvement value from optimizing headcount, workflow, machinery, and materials.",
            "category": "Case Study",
            "path": "/en/case-study/kaizen-cost-saving-pencil-factory.html",
            "image_alt": "Case Study: 432,873 USD Cost Improvement at Pencil Factory - INVAMAX"
        }
    },
    "case-study-operating-model-pencil-factory": {
        "og_image": "assets/images/og/og-cs-operating-model.jpg",
        "date_published": "2026-09-20",
        "date_modified": "2026-10-24",
        "vi": {
            "title": "Case Study: Thay đổi Operating Model tại nhà máy sản xuất bút chì | INVAMAX",
            "desc": "Case study thay đổi mô hình quản lý sản xuất tại nhà máy sản xuất bút chì: chuyển từ quản lý theo Mini Factory sang quản lý theo công đoạn, tối ưu 7 nhân lực và 35.734 USD/năm.",
            "category": "Case Study",
            "path": "/vi/case-study/operating-model-pencil-factory.html",
            "image_alt": "Case Study: Thay đổi Operating Model tại nhà máy sản xuất bút chì - INVAMAX"
        },
        "en": {
            "title": "Case Study: Operating Model Transformation at a Pencil Factory | INVAMAX",
            "desc": "Case study on transforming the production management model at a pencil factory: shifting from Mini Factory to specialized stage management, optimizing 7 headcount and $35,734/year.",
            "category": "Case Study",
            "path": "/en/case-study/operating-model-pencil-factory.html",
            "image_alt": "Case Study: Operating Model Transformation at a Pencil Factory - INVAMAX"
        }
    }
}

DEFAULT_FALLBACK = {
    "og_image": "assets/images/og/og-default-invamax.jpg",
    "vi": {
        "title": "INVAMAX - Đối tác Vận hành và Phát triển Nhà máy",
        "desc": "INVAMAX đồng hành cùng doanh nghiệp sản xuất trong việc đánh giá hiện trạng, nhận diện lãng phí, cải thiện dòng chảy và xây dựng hệ thống quản trị vận hành FOS™.",
        "category": "Vận hành nhà máy",
        "image_alt": "INVAMAX - Đối tác Vận hành và Phát triển Nhà máy"
    },
    "en": {
        "title": "INVAMAX - Factory Operations & Development Partner",
        "desc": "INVAMAX partners with manufacturing enterprises in operational assessment, waste reduction, flow optimization, and building sustainable Factory Operating Systems.",
        "category": "Operations Management",
        "image_alt": "INVAMAX - Factory Operations & Development Partner"
    }
}

def generate_metadata_block(slug, lang="vi", custom_data=None):
    data = ARTICLE_REGISTRY.get(slug)
    if not data and custom_data:
        data = custom_data
    if not data:
        data = DEFAULT_FALLBACK
        
    lang_info = data.get(lang, data.get("vi"))
    alt_lang = "en" if lang == "vi" else "vi"
    alt_info = data.get(alt_lang, lang_info)
    
    title = lang_info.get("title")
    desc = lang_info.get("desc")
    path = lang_info.get("path", f"/{lang}/{slug}.html")
    alt_path = alt_info.get("path", f"/{alt_lang}/{slug}.html")
    
    canonical_url = f"{BASE_URL}{path}"
    alt_url = f"{BASE_URL}{alt_path}"
    
    og_img_rel = data.get("og_image", "assets/images/og/og-default-invamax.jpg")
    og_image_url = f"{BASE_URL}/{og_img_rel}"
    og_image_alt = lang_info.get("image_alt", title)
    
    locale = "vi_VN" if lang == "vi" else "en_US"
    alt_locale = "en_US" if lang == "vi" else "vi_VN"
    in_language = "vi-VN" if lang == "vi" else "en-US"
    
    date_pub = data.get("date_published", "2026-10-24")
    date_mod = data.get("date_modified", "2026-10-24")
    
    json_ld = {
        "@context": "https://schema.org",
        "@type": "Article",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": canonical_url
        },
        "headline": title,
        "description": desc,
        "image": [
            og_image_url
        ],
        "author": {
            "@type": "Organization",
            "name": "INVAMAX",
            "url": BASE_URL
        },
        "publisher": {
            "@type": "Organization",
            "name": "INVAMAX",
            "logo": {
                "@type": "ImageObject",
                "url": f"{BASE_URL}/assets/images/home/logo-invamax-original.png"
            }
        },
        "datePublished": date_pub,
        "dateModified": date_mod,
        "inLanguage": in_language
    }
    
    block = f"""    <!-- Title & SEO Meta -->
    <title>{title}</title>
    <meta name="description" content="{desc}">
    <link rel="canonical" href="{canonical_url}">
    <link rel="alternate" hreflang="{lang}" href="{canonical_url}">
    <link rel="alternate" hreflang="{alt_lang}" href="{alt_url}">
    <link rel="alternate" hreflang="x-default" href="{canonical_url}">

    <!-- Open Graph / Facebook / Zalo / LinkedIn -->
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="INVAMAX">
    <meta property="og:locale" content="{locale}">
    <meta property="og:locale:alternate" content="{alt_locale}">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{desc}">
    <meta property="og:url" content="{canonical_url}">
    <meta property="og:image" content="{og_image_url}">
    <meta property="og:image:secure_url" content="{og_image_url}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="{og_image_alt}">
    <meta property="og:image:type" content="image/jpeg">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{desc}">
    <meta name="twitter:image" content="{og_image_url}">
    <meta name="twitter:image:alt" content="{og_image_alt}">

    <!-- Schema.org Article Structured Data (JSON-LD) -->
    <script type="application/ld+json">
{json.dumps(json_ld, ensure_ascii=False, indent=4)}
    </script>"""
    return block

def strip_old_metadata(head_html):
    patterns = [
        r'<title>[^<]*</title>',
        r'<meta[^>]*name=[\'"]description[\'"][^>]*>',
        r'<meta[^>]*content=[^>]*name=[\'"]description[\'"][^>]*>',
        r'<link[^>]*rel=[\'"]canonical[\'"][^>]*>',
        r'<link[^>]*rel=[\'"]alternate[\'"][^>]*>',
        r'<meta[^>]*property=[\'"]og:[^>]+>',
        r'<meta[^>]*content=[^>]*property=[\'"]og:[^>]+>',
        r'<meta[^>]*name=[\'"]twitter:[^>]+>',
        r'<meta[^>]*content=[^>]*name=[\'"]twitter:[^>]+>',
        r'<script[^>]*type=[\'"]application/ld\+json[\'"][^>]*>[\s\S]*?</script>',
        r'<!--\s*(?:Title|SEO|Open Graph|Twitter Card|Schema|Article Structured Data|Canonical)[^>]*?-->'
    ]
    cleaned = head_html
    for pat in patterns:
        cleaned = re.sub(pat, '', cleaned, flags=re.IGNORECASE)
    cleaned = re.sub(r'\n\s*\n\s*\n', '\n\n', cleaned)
    return cleaned

def update_article_file(repo_dir, rel_path, slug=None):
    abs_path = os.path.join(repo_dir, rel_path.replace('/', os.sep))
    if not os.path.exists(abs_path):
        print(f"Error: {rel_path} does not exist!")
        return False
        
    with open(abs_path, 'r', encoding='utf-8') as f:
        html = f.read()
        
    head_start = html.find('<head>')
    head_end = html.find('</head>')
    if head_start == -1 or head_end == -1:
        print(f"Error: No <head> found in {rel_path}")
        return False
        
    head_content = html[head_start+6:head_end]
    lang = "en" if rel_path.startswith("en/") else "vi"
    
    if not slug:
        fname = os.path.splitext(os.path.basename(rel_path))[0]
        if 'productivity-improvement-pencil-factory' in fname:
            slug = 'case-study-productivity-improvement-pencil-factory'
        elif 'kaizen-cost-saving-pencil-factory' in fname:
            slug = 'case-study-kaizen-cost-saving-pencil-factory'
        elif 'operating-model-pencil-factory' in fname:
            slug = 'case-study-operating-model-pencil-factory'
        else:
            slug = fname
            
    meta_block = generate_metadata_block(slug, lang)
    cleaned_head = strip_old_metadata(head_content)
    
    charset_viewport = ""
    cv_matches = re.findall(r'<meta[^>]+(?:charset|viewport)[^>]*>', cleaned_head, re.I)
    for m in cv_matches:
        cleaned_head = cleaned_head.replace(m, '')
        charset_viewport += f"    {m}\n"
        
    cleaned_head = cleaned_head.strip()
    new_head = f"\n{charset_viewport}\n{meta_block}\n\n    {cleaned_head}\n"
    new_html = html[:head_start+6] + new_head + html[head_end:]
    
    with open(abs_path, 'w', encoding='utf-8') as f:
        f.write(new_html)
    print(f"Successfully updated metadata in {rel_path}")
    return True

def verify_all_metadata(repo_dir):
    print("=" * 80)
    print("VERIFYING OPEN GRAPH & PREVIEW METADATA ACROSS ALL ARTICLES")
    print("=" * 80)
    
    all_passed = True
    total_articles = 0
    passed_articles = 0
    
    for slug, d in ARTICLE_REGISTRY.items():
        og_img_rel = d['og_image']
        og_img_abs = os.path.join(repo_dir, og_img_rel.replace('/', os.sep))
        
        # Check physical image
        if not os.path.exists(og_img_abs):
            print(f"[FAIL] Image file missing: {og_img_rel}")
            all_passed = False
            continue
            
        with Image.open(og_img_abs) as im:
            w, h = im.size
            if (w, h) != (1200, 630):
                print(f"[FAIL] Image {og_img_rel} dimensions are {w}x{h}, expected 1200x630!")
                all_passed = False
                
        for lang in ['vi', 'en']:
            total_articles += 1
            rel_path = d[lang]['path'].lstrip('/')
            abs_path = os.path.join(repo_dir, rel_path.replace('/', os.sep))
            
            if not os.path.exists(abs_path):
                print(f"[FAIL] Article file missing: {rel_path}")
                all_passed = False
                continue
                
            with open(abs_path, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Verify required tags
            checks = [
                (r'<meta property="og:type" content="article">', "og:type"),
                (r'<meta property="og:site_name" content="INVAMAX">', "og:site_name"),
                (rf'<meta property="og:locale" content="{"vi_VN" if lang == "vi" else "en_US"}">', "og:locale"),
                (r'<meta property="og:title" content="[^"]+">', "og:title"),
                (r'<meta property="og:description" content="[^"]+">', "og:description"),
                (rf'<meta property="og:url" content="https://invamax\.com/{rel_path}">', "og:url"),
                (rf'<meta property="og:image" content="https://invamax\.com/{og_img_rel}">', "og:image"),
                (rf'<meta property="og:image:secure_url" content="https://invamax\.com/{og_img_rel}">', "og:image:secure_url"),
                (r'<meta property="og:image:width" content="1200">', "og:image:width"),
                (r'<meta property="og:image:height" content="630">', "og:image:height"),
                (r'<meta property="og:image:type" content="image/jpeg">', "og:image:type"),
                (r'<meta name="twitter:card" content="summary_large_image">', "twitter:card"),
                (r'<script type="application/ld\+json">[\s\S]*?"@type":\s*"Article"', "Schema.org JSON-LD")
            ]
            
            file_ok = True
            for pattern, name in checks:
                if not re.search(pattern, content):
                    print(f"[FAIL] {rel_path} missing or invalid: {name}")
                    file_ok = False
                    all_passed = False
                    
            # Check for bad hosts
            bad_matches = re.findall(r'https?://(?:localhost|127\.0\.0\.1|invamax\.vn)', content)
            if bad_matches:
                print(f"[FAIL] {rel_path} contains forbidden domain(s): {set(bad_matches)}")
                file_ok = False
                all_passed = False
                
            if file_ok:
                passed_articles += 1
                print(f"[PASS] {rel_path} - Complete OG, Twitter, Canonical & 1200x630 Image!")

    print("-" * 80)
    print(f"SUMMARY: {passed_articles}/{total_articles} articles fully verified and passed!")
    print("=" * 80)
    return all_passed

if __name__ == "__main__":
    repo_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    if len(sys.argv) > 1 and sys.argv[1] == '--all':
        for slug, d in ARTICLE_REGISTRY.items():
            vi_file = d['vi']['path'].lstrip('/')
            en_file = d['en']['path'].lstrip('/')
            update_article_file(repo_path, vi_file, slug)
            update_article_file(repo_path, en_file, slug)
    elif len(sys.argv) > 1 and sys.argv[1] == '--verify':
        verify_all_metadata(repo_path)
    else:
        print("Usage: python metadata_manager.py [--all | --verify]")
